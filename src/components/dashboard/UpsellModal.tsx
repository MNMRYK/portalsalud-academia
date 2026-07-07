import { X, MessageCircle, Mail, CalendarCheck, Lock, Sparkles } from "lucide-react";
import styles from "./UpsellModal.module.css";

export type UpsellVariant = "clinical" | "academy";

interface UpsellModalProps {
  variant: UpsellVariant | null;
  onClose: () => void;
}

const content = {
  clinical: {
    icon: Lock,
    eyebrow: "Portal Clínico",
    title: "Desbloquea tu acompañamiento clínico",
    desc: "Accede a tu plan de acción, diario de síntomas y documentos seguros. Habla con la clínica para activar tu Portal de Salud.",
    actions: [
      { icon: MessageCircle, label: "Escríbenos por WhatsApp", className: "whatsapp" },
      { icon: Mail, label: "Enviar un correo", className: "email" },
      { icon: CalendarCheck, label: "Reservar una cita", className: "book" },
    ],
  },
  academy: {
    icon: Sparkles,
    eyebrow: "Academia",
    title: "Únete a nuestra comunidad de aprendizaje",
    desc: "Cursos, clases en directo y material de apoyo para transformar tus hábitos. Descubre todo lo que la Academia tiene para ti.",
    actions: [
      { icon: Sparkles, label: "Ver planes y precios", className: "book" },
      { icon: MessageCircle, label: "Hablar con nosotros", className: "whatsapp" },
      { icon: Mail, label: "Recibir información", className: "email" },
    ],
  },
} as const;

export function UpsellModal({ variant, onClose }: UpsellModalProps) {
  if (!variant) return null;
  const data = content[variant];
  const Icon = data.icon;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`${styles.modal} ${variant === "academy" ? styles.modalAcademy : styles.modalClinical}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <span className={styles.iconBubble}>
          <Icon size={30} strokeWidth={1.8} />
        </span>
        <span className={styles.eyebrow}>{data.eyebrow}</span>
        <h2 className={styles.title}>{data.title}</h2>
        <p className={styles.desc}>{data.desc}</p>

        <div className={styles.actions}>
          {data.actions.map(({ icon: ActionIcon, label, className }) => (
            <button
              key={label}
              type="button"
              className={`${styles.actionButton} ${styles[className]}`}
              onClick={onClose}
            >
              <ActionIcon size={18} strokeWidth={2.1} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
