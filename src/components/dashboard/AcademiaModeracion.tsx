import { useState } from "react";
import { ShieldCheck, Check, Trash2, Flag } from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

interface ModItem {
  id: string;
  author: string;
  thread: string;
  excerpt: string;
  reason: string;
  date: string;
}

const initialQueue: ModItem[] = [
  {
    id: "m1",
    author: "Javier P.",
    thread: "Dudas sobre la fase 2 del plan",
    excerpt: "Yo llevo dos semanas tomando un suplemento que compré por internet...",
    reason: "Posible consejo médico no verificado",
    date: "hoy · 09:12",
  },
  {
    id: "m2",
    author: "Anónimo",
    thread: "Recetas de cena rápidas y saciantes",
    excerpt: "Os dejo mi enlace de descuento para comprar en...",
    reason: "Spam / promoción",
    date: "ayer · 21:40",
  },
];

/** Vista Moderación (Admin) — contenedor base de la cola de revisión de la comunidad. */
export function AcademiaModeracion() {
  const [queue, setQueue] = useState<ModItem[]>(initialQueue);
  const resolve = (id: string) => setQueue((q) => q.filter((i) => i.id !== id));

  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Moderación</h1>
            <p className={styles.greetingSub}>
              Revisa los mensajes reportados de la comunidad antes de publicarlos.
            </p>
          </div>
          <span className={academia.retChip}>
            <ShieldCheck size={14} /> {queue.length} pendientes
          </span>
        </header>

        {queue.length === 0 ? (
          <div className={academia.retEmpty}>
            No hay contenido pendiente de moderar. Todo está al día.
          </div>
        ) : (
          <section className={academia.comList}>
            {queue.map((item) => (
              <article key={item.id} className={academia.modCard}>
                <div className={academia.comThreadBody}>
                  <span className={academia.comThreadTitle}>{item.thread}</span>
                  <span className={academia.modExcerpt}>«{item.excerpt}»</span>
                  <span className={academia.comThreadMeta}>
                    {item.author} · {item.date}
                  </span>
                  <span className={academia.modReason}>
                    <Flag size={13} /> {item.reason}
                  </span>
                </div>
                <div className={academia.retActions}>
                  <button
                    type="button"
                    className={academia.retGhost}
                    onClick={() => resolve(item.id)}
                  >
                    <Check size={15} strokeWidth={2.4} /> Aprobar
                  </button>
                  <button
                    type="button"
                    className={academia.retDanger}
                    onClick={() => resolve(item.id)}
                  >
                    <Trash2 size={15} strokeWidth={2.4} /> Eliminar
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
