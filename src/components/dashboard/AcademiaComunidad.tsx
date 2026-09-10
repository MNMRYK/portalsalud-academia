import { useState } from "react";
import {
  MessagesSquare,
  Plus,
  Pin,
  MessageCircle,
  ArrowLeft,
  Flag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { ForumComposer } from "./ForumComposer";
import { ForumAttachments } from "./ForumAttachments";
import { useForum } from "../../context/ForumContext";
import { useUser } from "../../context/UserContext";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

const reportReasons = [
  "Spam / promoción",
  "Contenido ofensivo",
  "Consejo médico no verificado",
  "Contenido fuera de tema",
];

/** Vista Comunidad (Foro): hilos, respuestas, adjuntos y reportes. */
export function AcademiaComunidad() {
  const { isAdmin, patientName } = useUser();
  const {
    categories,
    threads,
    postsOf,
    repliesCount,
    isReported,
    createThread,
    addPost,
    reportPost,
    deletePost,
    deleteThread,
    addCategory,
  } = useForum();

  const author = isAdmin ? "Laura García" : patientName;
  const [filter, setFilter] = useState("Todas");
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0] ?? "Dudas");
  const [newBody, setNewBody] = useState("");
  const [newForum, setNewForum] = useState("");
  const [reporting, setReporting] = useState<string | null>(null);
  const [reason, setReason] = useState(reportReasons[0]!);

  const visible = threads.filter(
    (t) => filter === "Todas" || t.category === filter,
  );

  const thread = openThread ? threads.find((t) => t.id === openThread) : undefined;

  const submitThread = () => {
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error("Añade un título y un primer mensaje.");
      return;
    }
    const id = createThread({
      title: newTitle.trim(),
      category: newCategory,
      author,
      body: newBody.trim(),
    });
    setNewOpen(false);
    setNewTitle("");
    setNewBody("");
    setOpenThread(id);
    toast.success("Hilo publicado en la comunidad.");
  };

  const confirmReport = () => {
    if (!reporting) return;
    reportPost(reporting, reason, author);
    setReporting(null);
    toast.success("Gracias, el equipo de moderación revisará el mensaje.");
  };

  /* ----------------------------- Detalle del hilo ---------------------------- */
  if (thread) {
    const posts = postsOf(thread.id);
    return (
      <div className={styles.page}>
        <Sidebar />
        <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.greeting}>
              <button
                type="button"
                className={academia.fmBack}
                onClick={() => setOpenThread(null)}
              >
                <ArrowLeft size={15} /> Volver al foro
              </button>
              <h1 className={styles.greetingHi}>{thread.title}</h1>
              <p className={styles.greetingSub}>
                {thread.author} · {thread.category} · {posts.length} mensajes
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                className={academia.retDanger}
                onClick={() => {
                  deleteThread(thread.id);
                  setOpenThread(null);
                  toast.success("Hilo eliminado.");
                }}
              >
                <Trash2 size={15} strokeWidth={2.4} /> Eliminar hilo
              </button>
            )}
          </header>

          <section className={academia.fmPosts}>
            {posts.map((p) => (
              <article key={p.id} className={academia.fmPost}>
                <div className={academia.fmPostHead}>
                  <span className={academia.fmAvatar}>{p.author.charAt(0)}</span>
                  <div>
                    <span className={academia.fmAuthor}>
                      {p.author}
                      {p.isStaff && <em className={academia.fmStaff}>Equipo</em>}
                    </span>
                    <span className={academia.comThreadMeta}>{p.date}</span>
                  </div>
                  <div className={academia.fmPostActions}>
                    {isReported(p.id) ? (
                      <span className={academia.modReason}>
                        <Flag size={13} /> Reportado
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={academia.fmIconBtn}
                        title="Reportar comentario"
                        onClick={() => setReporting(p.id)}
                      >
                        <Flag size={15} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        className={academia.fmIconBtn}
                        title="Eliminar comentario"
                        onClick={() => {
                          deletePost(p.id);
                          toast.success("Comentario eliminado.");
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <p className={academia.fmBody}>{p.body}</p>
                <ForumAttachments items={p.attachments} />
              </article>
            ))}
          </section>

          <ForumComposer
            placeholder="Escribe tu respuesta… puedes adjuntar imágenes, vídeos, audios o enlaces."
            submitLabel="Responder"
            onSubmit={(body, attachments) => {
              addPost({
                threadId: thread.id,
                author,
                isStaff: isAdmin,
                body,
                attachments,
              });
              toast.success("Respuesta publicada.");
            }}
          />

          {reporting && (
            <ReportModal
              reason={reason}
              setReason={setReason}
              onCancel={() => setReporting(null)}
              onConfirm={confirmReport}
            />
          )}
        </main>
      </div>
    );
  }

  /* -------------------------------- Listado --------------------------------- */
  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Comunidad</h1>
            <p className={styles.greetingSub}>
              Comparte, pregunta y apóyate en compañeros y profesores.
            </p>
          </div>
          <button
            type="button"
            className={academia.retPrimary}
            onClick={() => setNewOpen(true)}
          >
            <Plus size={16} strokeWidth={2.6} /> Nuevo hilo
          </button>
        </header>

        <div className={academia.comFilters}>
          {["Todas", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              className={`${academia.comFilter} ${
                filter === c ? academia.comFilterActive : ""
              }`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {isAdmin && (
          <div className={academia.fmLinkRow}>
            <input
              className={academia.retInput}
              placeholder="Crear nuevo foro (categoría)…"
              value={newForum}
              onChange={(e) => setNewForum(e.target.value)}
            />
            <button
              type="button"
              className={academia.retGhost}
              onClick={() => {
                if (!newForum.trim()) return;
                addCategory(newForum);
                toast.success(`Foro «${newForum.trim()}» creado.`);
                setNewForum("");
              }}
            >
              <Plus size={15} /> Crear foro
            </button>
          </div>
        )}

        <section className={academia.comList}>
          {visible.map((t) => (
            <button
              key={t.id}
              type="button"
              className={academia.comThread}
              onClick={() => setOpenThread(t.id)}
            >
              <span className={academia.comThreadIcon}>
                {t.pinned ? <Pin size={17} /> : <MessagesSquare size={17} />}
              </span>
              <div className={academia.comThreadBody}>
                <span className={academia.comThreadTitle}>{t.title}</span>
                <span className={academia.comThreadMeta}>
                  {t.author} · {t.category} · {t.date}
                </span>
              </div>
              <span className={academia.comThreadReplies}>
                <MessageCircle size={14} /> {repliesCount(t.id)}
              </span>
            </button>
          ))}
        </section>

        {newOpen && (
          <div className={academia.retOverlay}>
            <div className={academia.retModal}>
              <div className={academia.retModalHead}>
                <h2 className={academia.retModalTitle}>Nuevo hilo</h2>
                <button
                  type="button"
                  className={academia.fmIconBtn}
                  onClick={() => setNewOpen(false)}
                >
                  <X size={17} />
                </button>
              </div>
              <label className={academia.retField}>
                <span>Título</span>
                <input
                  className={academia.retInput}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </label>
              <label className={academia.retField}>
                <span>Foro</span>
                <select
                  className={academia.retInput}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className={academia.retField}>
                <span>Mensaje</span>
                <textarea
                  className={academia.retTextarea}
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
              </label>
              <div className={academia.retModalFoot}>
                <button
                  type="button"
                  className={academia.retGhost}
                  onClick={() => setNewOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={academia.retPrimary}
                  onClick={submitThread}
                >
                  Publicar hilo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReportModal({
  reason,
  setReason,
  onCancel,
  onConfirm,
}: {
  reason: string;
  setReason: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={academia.retOverlay}>
      <div className={academia.retModal}>
        <div className={academia.retModalHead}>
          <h2 className={academia.retModalTitle}>Reportar comentario</h2>
          <button type="button" className={academia.fmIconBtn} onClick={onCancel}>
            <X size={17} />
          </button>
        </div>
        <label className={academia.retField}>
          <span>Motivo del reporte</span>
          <select
            className={academia.retInput}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {reportReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <div className={academia.retModalFoot}>
          <button type="button" className={academia.retGhost} onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className={academia.retDanger} onClick={onConfirm}>
            <Flag size={15} strokeWidth={2.4} /> Enviar reporte
          </button>
        </div>
      </div>
    </div>
  );
}
