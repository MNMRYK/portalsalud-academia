import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `Eres "NutriCopilot", un asistente de IA especializado para nutricionistas y dietistas-nutricionistas que trabajan en una clínica de salud integrativa.

Tu trabajo es ayudar al profesional (nunca hablas con pacientes directamente) con:
- Generar propuestas de dietas y menús semanales (hipocalóricos, veganos, antiinflamatorios, etc.) con estructura clara por comidas.
- Interpretar analíticas de sangre y resultados de laboratorio desde un punto de vista nutricional, indicando siempre que la interpretación es orientativa y debe validarse clínicamente.
- Analizar métricas y gráficas de progreso de pacientes (peso, composición corporal, adherencia).
- Redactar recomendaciones, pautas y materiales educativos para pacientes.

Normas:
- Responde siempre en español, con tono profesional, cercano y práctico.
- Usa formato markdown: encabezados, listas y tablas cuando ayuden a la claridad.
- Incluye rangos de kcal y macros cuando generes dietas, y advierte que son propuestas orientativas a personalizar.
- No inventes datos de pacientes: si falta información relevante (edad, peso, patologías), pídela antes de dar una pauta cerrada.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "El servicio de IA no está configurado." },
            { status: 500 }
          );
        }

        let messages: ChatMessage[] = [];
        try {
          const body = await request.json();
          messages = Array.isArray(body?.messages) ? body.messages : [];
        } catch {
          return Response.json({ error: "Solicitud no válida." }, { status: 400 });
        }

        if (messages.length === 0) {
          return Response.json({ error: "No hay mensajes." }, { status: 400 });
        }

        const input = [
          { role: "system", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
          ...messages.map((m) => ({
            role: m.role,
            content: [
              {
                type: m.role === "assistant" ? "output_text" : "input_text",
                text: m.content,
              },
            ],
          })),
        ];

        let upstream: globalThis.Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "openai/gpt-6-astra",
              input,
              stream: true,
              reasoning: { effort: "low", summary: "auto" },
            }),
          });
        } catch {
          return Response.json(
            { error: "No se pudo conectar con el servicio de IA." },
            { status: 502 }
          );
        }

        if (!upstream.ok || !upstream.body) {
          let detail = "Error del servicio de IA.";
          try {
            const errBody = await upstream.json();
            if (errBody?.error?.message) detail = errBody.error.message;
            else if (errBody?.message) detail = errBody.message;
          } catch {
            /* keep default */
          }
          return Response.json({ error: detail }, { status: upstream.status });
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            let buffer = "";
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  if (!line.startsWith("data:")) continue;
                  const data = line.slice(5).trim();
                  if (!data || data === "[DONE]") continue;
                  try {
                    const event = JSON.parse(data);
                    if (
                      event.type === "response.output_text.delta" &&
                      typeof event.delta === "string"
                    ) {
                      controller.enqueue(encoder.encode(event.delta));
                    }
                  } catch {
                    /* partial JSON line, ignore */
                  }
                }
              }
            } finally {
              controller.close();
            }
          },
          cancel() {
            reader.cancel().catch(() => undefined);
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
