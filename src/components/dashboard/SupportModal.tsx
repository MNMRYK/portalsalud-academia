import { useState } from "react";
import { toast } from "sonner";
import { X, LifeBuoy, Send } from "lucide-react";
import styles from "./SupportModal.module.css";

type SupportContext = "salud" | "academia";

export function SupportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [context, setContext] = useState<SupportContext>("salud");
  const [message, setMessage] = useState("");

  if (!open) return null;

  const reset = () => {
    setContext("salud");
    setMessage("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    toast.success("Ticket recibido. Te responderemos pronto");
    reset();
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.close}
          onClick={handleClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <span className={styles.iconBubble}>
          <LifeBuoy size={26} strokeWidth={1.9} />
        </span>
        <h2 className={styles.title}>Ayuda y Soporte</h2>
        <p className={styles.subtitle}>
          Cuéntanos qué necesitas y nuestro equipo te responderá lo antes
          posible.
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="support-context">
            ¿Sobre qué necesitas ayuda?
          </label>
          <select
            id="support-context"
            className={styles.select}
            value={context}
            onChange={(e) => setContext(e.target.value as SupportContext)}
          >
            <option value="salud">Portal de Salud</option>
            <option value="academia">Módulo Academia</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="support-message">
            Tu consulta
          </label>
          <textarea
            id="support-message"
            className={styles.textarea}
            placeholder="Describe tu consulta o problema técnico..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSubmit}
            disabled={message.trim().length === 0}
          >
            <Send size={16} /> Enviar ticket
          </button>
        </div>
      </div>
    </div>
  );
}
