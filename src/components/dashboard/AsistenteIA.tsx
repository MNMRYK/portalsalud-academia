import { useEffect, useRef, useState } from "react";
import {
  Salad,
  FlaskConical,
  UtensilsCrossed,
  LineChart,
  Paperclip,
  SendHorizonal,
  BotMessageSquare,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import styles from "./AsistenteIA.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { icon: Salad, text: "Generar dieta hipocalórica de 1500 kcal" },
  { icon: FlaskConical, text: "Interpretar resultados de analítica" },
  { icon: UtensilsCrossed, text: "Crear menú semanal vegano" },
  { icon: LineChart, text: "Analizar gráfica de progreso del paciente" },
];

export function AsistenteIA() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [messages, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [loading]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || loading) return;

    const withAttachment = attachment
      ? `${text}\n\n[Archivo adjunto: ${attachment}]`
      : text;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: withAttachment },
    ];
    setMessages(nextMessages);
    setInput("");
    setAttachment(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        let detail = "No se pudo obtener respuesta del asistente.";
        try {
          const err = await res.json();
          if (err?.error) detail = err.error;
        } catch {
          /* keep default */
        }
        throw new Error(detail);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages([...nextMessages, { role: "assistant", content: "" }]);

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: snapshot };
          return copy;
        });
      }

      if (!acc.trim()) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "No he podido generar una respuesta. Inténtalo de nuevo.",
          };
          return copy;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file.name);
    e.target.value = "";
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <BotMessageSquare size={22} />
        </div>
        <div>
          <h1 className={styles.headerTitle}>Asistente IA</h1>
          <p className={styles.headerSubtitle}>
            Tu copiloto nutricional: dietas, analíticas y progreso de pacientes.
          </p>
        </div>
      </header>

      <div className={styles.chatArea} ref={chatRef}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BotMessageSquare size={34} />
            </div>
            <div>
              <h2 className={styles.emptyTitle}>¿En qué puedo ayudarte hoy?</h2>
              <p className={styles.emptySubtitle}>
                Genera dietas, interpreta analíticas o analiza el progreso de
                tus pacientes. También puedes adjuntar archivos de referencia.
              </p>
            </div>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  className={styles.suggestionCard}
                  onClick={() => void send(text)}
                >
                  <span className={styles.suggestionIcon}>
                    <Icon size={18} />
                  </span>
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.messageRow} ${
                  m.role === "user" ? styles.messageRowUser : ""
                }`}
              >
                {m.role === "assistant" && (
                  <div className={`${styles.avatar} ${styles.avatarAssistant}`}>
                    <BotMessageSquare size={17} />
                  </div>
                )}
                <div
                  className={`${styles.bubble} ${
                    m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant
                  }`}
                >
                  {m.role === "assistant" ? (
                    m.content ? (
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    ) : (
                      <span className={styles.thinking}>
                        Pensando
                        <span className={styles.thinkingDots}>
                          <span />
                          <span />
                          <span />
                        </span>
                      </span>
                    )
                  ) : (
                    m.content
                  )}
                </div>
                {m.role === "user" && (
                  <div className={`${styles.avatar} ${styles.avatarUser}`}>
                    LG
                  </div>
                )}
              </div>
            ))}
            {loading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className={styles.messageRow}>
                  <div className={`${styles.avatar} ${styles.avatarAssistant}`}>
                    <BotMessageSquare size={17} />
                  </div>
                  <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                    <span className={styles.thinking}>
                      Pensando
                      <span className={styles.thinkingDots}>
                        <span />
                        <span />
                        <span />
                      </span>
                    </span>
                  </div>
                </div>
              )}
          </>
        )}
        {error && <div className={styles.errorBox}>{error}</div>}
      </div>

      <div className={styles.composer}>
        {attachment && (
          <span className={styles.attachmentChip}>
            <Paperclip size={13} />
            {attachment}
            <button
              type="button"
              className={styles.attachmentRemove}
              onClick={() => setAttachment(null)}
              aria-label="Quitar adjunto"
            >
              <X size={14} />
            </button>
          </span>
        )}
        <div className={styles.composerInner}>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*,.csv,.txt"
            style={{ display: "none" }}
            onChange={onPickFile}
          />
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => fileRef.current?.click()}
            aria-label="Adjuntar archivo"
            title="Adjuntar archivo (analíticas, gráficas, métricas)"
          >
            <Paperclip size={19} />
          </button>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            rows={1}
            placeholder="Escribe tu consulta nutricional…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <button
            type="button"
            className={styles.sendButton}
            onClick={() => void send()}
            disabled={!input.trim() || loading}
            aria-label="Enviar"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
        <p className={styles.composerHint}>
          El asistente genera propuestas orientativas. Valida siempre la
          información clínicamente antes de aplicarla con un paciente.
        </p>
      </div>
    </div>
  );
}
