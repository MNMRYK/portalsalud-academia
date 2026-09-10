import { useRef, useState } from "react";
import { Image, Video, Mic, Link2, X, Send } from "lucide-react";
import type { Attachment, AttachmentKind } from "../../context/ForumContext";
import academia from "./Academia.module.css";

const uid = () => Math.random().toString(36).slice(2, 10);

const acceptFor: Record<Exclude<AttachmentKind, "link">, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
};

interface Props {
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (body: string, attachments: Attachment[]) => void;
}

/** Caja de redacción del foro con adjuntos (imagen, vídeo, audio y enlaces). */
export function ForumComposer({ placeholder, submitLabel, onSubmit }: Props) {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const pendingKind = useRef<Exclude<AttachmentKind, "link">>("image");

  const pickFile = (kind: Exclude<AttachmentKind, "link">) => {
    pendingKind.current = kind;
    if (fileRef.current) {
      fileRef.current.accept = acceptFor[kind];
      fileRef.current.value = "";
      fileRef.current.click();
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: uid(),
        kind: pendingKind.current,
        url: URL.createObjectURL(file),
        name: file.name,
      },
    ]);
  };

  const addLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    setAttachments((prev) => [
      ...prev,
      { id: uid(), kind: "link", url, name: url.replace(/^https?:\/\//, "") },
    ]);
    setLinkUrl("");
    setLinkOpen(false);
  };

  const remove = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const submit = () => {
    if (!body.trim() && attachments.length === 0) return;
    onSubmit(body.trim(), attachments);
    setBody("");
    setAttachments([]);
  };

  return (
    <div className={academia.fmComposer}>
      <textarea
        className={academia.fmTextarea}
        rows={3}
        value={body}
        placeholder={placeholder ?? "Escribe tu mensaje…"}
        onChange={(e) => setBody(e.target.value)}
      />

      {attachments.length > 0 && (
        <ul className={academia.fmChips}>
          {attachments.map((a) => (
            <li key={a.id} className={academia.fmChip}>
              {a.kind === "image" && <Image size={13} />}
              {a.kind === "video" && <Video size={13} />}
              {a.kind === "audio" && <Mic size={13} />}
              {a.kind === "link" && <Link2 size={13} />}
              <span>{a.name}</span>
              <button
                type="button"
                aria-label={`Quitar ${a.name}`}
                onClick={() => remove(a.id)}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {linkOpen && (
        <div className={academia.fmLinkRow}>
          <input
            className={academia.retInput}
            placeholder="https://…"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <button type="button" className={academia.retGhost} onClick={addLink}>
            Añadir enlace
          </button>
        </div>
      )}

      <div className={academia.fmComposerFoot}>
        <div className={academia.fmTools}>
          <button type="button" title="Imagen" onClick={() => pickFile("image")}>
            <Image size={16} />
          </button>
          <button type="button" title="Vídeo" onClick={() => pickFile("video")}>
            <Video size={16} />
          </button>
          <button type="button" title="Audio" onClick={() => pickFile("audio")}>
            <Mic size={16} />
          </button>
          <button
            type="button"
            title="Enlace"
            onClick={() => setLinkOpen((v) => !v)}
          >
            <Link2 size={16} />
          </button>
        </div>
        <button type="button" className={academia.retPrimary} onClick={submit}>
          <Send size={15} strokeWidth={2.4} /> {submitLabel ?? "Publicar"}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={onFile}
        aria-hidden="true"
      />
    </div>
  );
}
