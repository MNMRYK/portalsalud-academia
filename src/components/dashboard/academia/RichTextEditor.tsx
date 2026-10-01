import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
} from "lucide-react";
import styles from "../Academia.module.css";

/**
 * Editor de texto enriquecido ligero basado en contentEditable.
 * Incluye H2/H3/H4, negrita, cursiva, subrayado, tachado y listas.
 * NO incluye selector de tipografía: hereda la fuente global (Nunito).
 */
export function RichTextEditor({
  placeholder = "Escribe el contenido de la lección…",
  initialHtml = "",
  onChange,
}: {
  placeholder?: string;
  initialHtml?: string;
  onChange?: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // Solo al montar: el contenido posterior lo controla el usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (command: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, value);
    onChange?.(ref.current?.innerHTML ?? "");
  };

  const block = (tag: string) => exec("formatBlock", tag);

  return (
    <div className={styles.editor}>
      <div className={styles.editorToolbar}>
        <button type="button" className={styles.editorBtn} onClick={() => block("H2")}>
          H2
        </button>
        <button type="button" className={styles.editorBtn} onClick={() => block("H3")}>
          H3
        </button>
        <button type="button" className={styles.editorBtn} onClick={() => block("H4")}>
          H4
        </button>
        <button type="button" className={styles.editorBtn} onClick={() => block("P")}>
          P
        </button>
        <span className={styles.editorDivider} />
        <button
          type="button"
          className={styles.editorBtn}
          onClick={() => exec("bold")}
          aria-label="Negrita"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className={styles.editorBtn}
          onClick={() => exec("italic")}
          aria-label="Cursiva"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className={styles.editorBtn}
          onClick={() => exec("underline")}
          aria-label="Subrayado"
        >
          <Underline size={15} />
        </button>
        <button
          type="button"
          className={styles.editorBtn}
          onClick={() => exec("strikeThrough")}
          aria-label="Tachado"
        >
          <Strikethrough size={15} />
        </button>
        <span className={styles.editorDivider} />
        <button
          type="button"
          className={styles.editorBtn}
          onClick={() => exec("insertUnorderedList")}
          aria-label="Lista con puntos"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          className={styles.editorBtn}
          onClick={() => exec("insertOrderedList")}
          aria-label="Lista numerada"
        >
          <ListOrdered size={15} />
        </button>
      </div>

      <div
        ref={ref}
        className={styles.editorContent}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
