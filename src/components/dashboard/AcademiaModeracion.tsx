import { useState } from "react";
import { ShieldCheck, Check, Trash2, Flag, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { ForumAttachments } from "./ForumAttachments";
import { useForum } from "../../context/ForumContext";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

const reportReasons = [
  "Spam / promoción",
  "Contenido ofensivo",
  "Consejo médico no verificado",
  "Contenido fuera de tema",
];

/** Vista Moderación (Admin): cola de reportes y revisión de todos los mensajes. */
export function AcademiaModeracion() {
  const {
    posts,
    threads,
    pendingReports,
    isReported,
    resolveReport,
    deletePost,
    reportPost,
  } = useForum();
  const [tab, setTab] = useState<"reportados" | "todos">("reportados");
  const [reporting, setReporting] = useState<string | null>(null);
  const [reason, setReason] = useState(reportReasons[0]!);

  const titleOf = (threadId: string) =>
    threads.find((t) => t.id === threadId)?.title ?? "Hilo eliminado";

  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Moderación</h1>
            <p className={styles.greetingSub}>
              Revisa los reportes de la comunidad y todos los mensajes publicados.
            </p>
          </div>
          <span className={academia.retChip}>
            <ShieldCheck size={14} /> {pendingReports.length} pendientes
          </span>
        </header>

        <div className={academia.comFilters}>
          <button
            type="button"
            className={`${academia.comFilter} ${
              tab === "reportados" ? academia.comFilterActive : ""
            }`}
            onClick={() => setTab("reportados")}
          >
            Reportados ({pendingReports.length})
          </button>
          <button
            type="button"
            className={`${academia.comFilter} ${
              tab === "todos" ? academia.comFilterActive : ""
            }`}
            onClick={() => setTab("todos")}
          >
            Todos los comentarios ({posts.length})
          </button>
        </div>

        {tab === "reportados" ? (
          pendingReports.length === 0 ? (
            <div className={academia.retEmpty}>
              No hay contenido pendiente de moderar. Todo está al día.
            </div>
          ) : (
            <section className={academia.comList}>
              {pendingReports.map((r) => {
                const post = posts.find((p) => p.id === r.postId);
                return (
                  <article key={r.id} className={academia.modCard}>
                    <div className={academia.comThreadBody}>
                      <span className={academia.comThreadTitle}>
                        {titleOf(r.threadId)}
                      </span>
                      <span className={academia.modExcerpt}>
                        «{post?.body ?? "Mensaje ya eliminado"}»
                      </span>
                      {post && <ForumAttachments items={post.attachments} />}
                      <span className={academia.comThreadMeta}>
                        {post?.author ?? "—"} · reportado por {r.reportedBy} · {r.date}
                      </span>
                      <span className={academia.modReason}>
                        <Flag size={13} /> {r.reason}
                      </span>
                    </div>
                    <div className={academia.retActions}>
                      <button
                        type="button"
                        className={academia.retGhost}
                        onClick={() => {
                          resolveReport(r.id);
                          toast.success("Reporte descartado, el mensaje se mantiene.");
                        }}
                      >
                        <Check size={15} strokeWidth={2.4} /> Aprobar
                      </button>
                      <button
                        type="button"
                        className={academia.retDanger}
                        onClick={() => {
                          if (post) deletePost(post.id);
                          resolveReport(r.id);
                          toast.success("Comentario eliminado.");
                        }}
                      >
                        <Trash2 size={15} strokeWidth={2.4} /> Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )
        ) : (
          <section className={academia.comList}>
            {posts.map((p) => (
              <article key={p.id} className={academia.modCard}>
                <div className={academia.comThreadBody}>
                  <span className={academia.comThreadTitle}>
                    <MessagesSquare size={14} /> {titleOf(p.threadId)}
                  </span>
                  <span className={academia.modExcerpt}>«{p.body}»</span>
                  <ForumAttachments items={p.attachments} />
                  <span className={academia.comThreadMeta}>
                    {p.author} · {p.date}
                  </span>
                  {isReported(p.id) && (
                    <span className={academia.modReason}>
                      <Flag size={13} /> Reportado
                    </span>
                  )}
                </div>
                <div className={academia.retActions}>
                  {!isReported(p.id) && (
                    <button
                      type="button"
                      className={academia.retGhost}
                      onClick={() => setReporting(p.id)}
                    >
                      <Flag size={15} strokeWidth={2.4} /> Reportar
                    </button>
                  )}
                  <button
                    type="button"
                    className={academia.retDanger}
                    onClick={() => {
                      deletePost(p.id);
                      toast.success("Comentario eliminado.");
                    }}
                  >
                    <Trash2 size={15} strokeWidth={2.4} /> Eliminar
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {reporting && (
          <div className={academia.retOverlay}>
            <div className={academia.retModal}>
              <div className={academia.retModalHead}>
                <h2 className={academia.retModalTitle}>Marcar comentario</h2>
              </div>
              <label className={academia.retField}>
                <span>Motivo</span>
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
                <button
                  type="button"
                  className={academia.retGhost}
                  onClick={() => setReporting(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={academia.retDanger}
                  onClick={() => {
                    reportPost(reporting, reason, "Moderación");
                    setReporting(null);
                    toast.success("Comentario marcado para revisión.");
                  }}
                >
                  <Flag size={15} strokeWidth={2.4} /> Marcar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
