import { useState } from "react";
import {
  X,
  Info,
  Shield,
  GraduationCap,
  Mail,
  User,
  FileSignature,
  UploadCloud,
} from "lucide-react";
import styles from "./AddPatientModal.module.css";

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
}

type SignMode = "email" | "presencial";

const masterDocuments = [
  {
    id: "consentimiento",
    label: "Consentimiento informado",
    desc: "Autorización para el tratamiento nutricional y clínico.",
  },
  {
    id: "rgpd",
    label: "Cláusula RGPD",
    desc: "Protección de datos personales y política de privacidad.",
  },
  {
    id: "contrato",
    label: "Contrato de servicios",
    desc: "Condiciones económicas y alcance del acompañamiento.",
  },
];

export function AddPatientModal({ open, onClose }: AddPatientModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [academyEnabled, setAcademyEnabled] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    "consentimiento",
    "rgpd",
  ]);
  const [signMode, setSignMode] = useState<SignMode>("email");
  const [signedFile, setSignedFile] = useState<string | null>(null);

  if (!open) return null;

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-patient-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h2 id="add-patient-title" className={styles.modalTitle}>
              Dar de alta nuevo paciente
            </h2>
            <p className={styles.modalSub}>
              Invita a tu paciente a completar su ficha médica.
            </p>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.helpBox}>
            <Info size={18} className={styles.helpIcon} />
            <p className={styles.helpText}>
              Solo necesitas lo básico. El sistema enviará un email automático al
              paciente para que complete su ficha médica y cree su contraseña de
              acceso.
            </p>
          </div>

          <div className={styles.formFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="patient-name">
                Nombre completo
              </label>
              <div className={styles.inputWrap}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="patient-name"
                  type="text"
                  className={styles.textInput}
                  placeholder="Ej: María López García"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="patient-email">
                Correo electrónico
              </label>
              <div className={styles.inputWrap}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="patient-email"
                  type="email"
                  className={styles.textInput}
                  placeholder="maria@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className={styles.permissionsBox}>
            <h3 className={styles.permissionsTitle}>Permisos y Accesos</h3>

            <label className={styles.toggleRow}>
              <span className={styles.toggleIconBox}>
                <Shield size={18} />
              </span>
              <span className={styles.toggleContent}>
                <span className={styles.toggleLabel}>
                  Activar Portal de Salud
                </span>
                <span className={styles.toggleHint}>
                  Da acceso al área clínica, documentos seguros y evolución.
                </span>
              </span>
              <span className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={portalEnabled}
                  onChange={(e) => setPortalEnabled(e.target.checked)}
                />
                <span className={styles.toggleTrack} aria-hidden="true" />
              </span>
            </label>

            <label className={styles.toggleRow}>
              <span className={styles.toggleIconBox}>
                <GraduationCap size={18} />
              </span>
              <span className={styles.toggleContent}>
                <span className={styles.toggleLabel}>Activar Academia</span>
                <span className={styles.toggleHint}>
                  Si se mantiene inactivo, el paciente verá la Academia bloqueada
                  con un candado (Upsell automático). Si la compra online, se
                  desbloqueará sola.
                </span>
              </span>
              <span className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={academyEnabled}
                  onChange={(e) => setAcademyEnabled(e.target.checked)}
                />
                <span className={styles.toggleTrack} aria-hidden="true" />
              </span>
            </label>
          </div>

          <div className={styles.legalBox}>
            <div className={styles.legalHead}>
              <span className={styles.legalIconBox}>
                <FileSignature size={18} />
              </span>
              <div>
                <h3 className={styles.legalTitle}>
                  Documentación Legal Requerida
                </h3>
                <p className={styles.legalSub}>
                  Selecciona los documentos maestros definidos en Ajustes.
                </p>
              </div>
            </div>

            <div className={styles.checkList}>
              {masterDocuments.map((doc) => {
                const checked = selectedDocs.includes(doc.id);
                return (
                  <label
                    key={doc.id}
                    className={`${styles.checkRow} ${
                      checked ? styles.checkRowActive : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={checked}
                      onChange={() => toggleDoc(doc.id)}
                    />
                    <span className={styles.checkContent}>
                      <span className={styles.checkLabel}>{doc.label}</span>
                      <span className={styles.checkDesc}>{doc.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className={styles.signBlock}>
              <span className={styles.signHeading}>Modo de firma</span>

              <label
                className={`${styles.radioRow} ${
                  signMode === "email" ? styles.radioRowActive : ""
                }`}
              >
                <input
                  type="radio"
                  name="sign-mode"
                  className={styles.radio}
                  checked={signMode === "email"}
                  onChange={() => setSignMode("email")}
                />
                <span className={styles.radioContent}>
                  <span className={styles.radioLabel}>
                    Enviar por email para firma digital
                  </span>
                  <span className={styles.radioDesc}>
                    El paciente firmará los documentos desde su portal.
                  </span>
                </span>
              </label>

              <label
                className={`${styles.radioRow} ${
                  signMode === "presencial" ? styles.radioRowActive : ""
                }`}
              >
                <input
                  type="radio"
                  name="sign-mode"
                  className={styles.radio}
                  checked={signMode === "presencial"}
                  onChange={() => setSignMode("presencial")}
                />
                <span className={styles.radioContent}>
                  <span className={styles.radioLabel}>
                    Documento ya firmado presencialmente
                  </span>
                  <span className={styles.radioDesc}>
                    Sube el PDF firmado para archivarlo en la ficha.
                  </span>
                </span>
              </label>

              {signMode === "presencial" && (
                <label className={styles.uploadZone}>
                  <input
                    type="file"
                    accept="application/pdf"
                    className={styles.uploadInput}
                    onChange={(e) =>
                      setSignedFile(e.target.files?.[0]?.name ?? null)
                    }
                  />
                  <UploadCloud size={22} className={styles.uploadIcon} />
                  <span className={styles.uploadText}>
                    {signedFile
                      ? signedFile
                      : "Arrastra o haz clic para subir el PDF firmado"}
                  </span>
                </label>
              )}
            </div>

            <div className={styles.noteBox}>
              <Info size={16} className={styles.noteIcon} />
              <p className={styles.noteText}>
                El paciente recibirá el aviso legal seleccionado junto a su email
                de acceso al portal.
              </p>
            </div>
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={styles.primaryButton}>
            <Mail size={18} strokeWidth={2.5} /> Enviar Invitación
          </button>
        </footer>
      </div>
    </div>
  );
}
