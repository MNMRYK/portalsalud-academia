import { Link2 } from "lucide-react";
import type { Attachment } from "../../context/ForumContext";
import academia from "./Academia.module.css";

/** Render de los adjuntos de un mensaje del foro. */
export function ForumAttachments({ items }: { items: Attachment[] }) {
  if (items.length === 0) return null;
  return (
    <div className={academia.fmAttachments}>
      {items.map((a) => {
        if (a.kind === "image") {
          return (
            <img key={a.id} className={academia.fmImage} src={a.url} alt={a.name} />
          );
        }
        if (a.kind === "video") {
          return (
            <video key={a.id} className={academia.fmVideo} src={a.url} controls />
          );
        }
        if (a.kind === "audio") {
          return (
            <audio key={a.id} className={academia.fmAudio} src={a.url} controls />
          );
        }
        return (
          <a
            key={a.id}
            className={academia.fmLink}
            href={a.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Link2 size={14} /> {a.name}
          </a>
        );
      })}
    </div>
  );
}
