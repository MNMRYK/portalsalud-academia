import { useState } from "react";
import { MessagesSquare, Plus, Pin, MessageCircle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

interface Thread {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  last: string;
  pinned?: boolean;
}

const initialThreads: Thread[] = [
  {
    id: "t0",
    title: "Normas de la comunidad y cómo participar",
    author: "Equipo Academia",
    category: "Anuncios",
    replies: 3,
    last: "hace 2 días",
    pinned: true,
  },
  {
    id: "t1",
    title: "¿Cómo organizáis la compra semanal?",
    author: "Elena M.",
    category: "Hábitos",
    replies: 14,
    last: "hace 5 h",
  },
  {
    id: "t2",
    title: "Recetas de cena rápidas y saciantes",
    author: "Marta R.",
    category: "Recetas",
    replies: 27,
    last: "hace 1 día",
  },
  {
    id: "t3",
    title: "Dudas sobre la fase 2 del plan",
    author: "Javier P.",
    category: "Dudas",
    replies: 6,
    last: "hace 3 días",
  },
];

const categories = ["Todas", "Anuncios", "Hábitos", "Recetas", "Dudas"];

/** Vista Comunidad (Foro) — contenedor base preparado para la interacción real. */
export function AcademiaComunidad() {
  const [filter, setFilter] = useState("Todas");
  const threads = initialThreads.filter(
    (t) => filter === "Todas" || t.category === filter,
  );

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
          <button type="button" className={academia.retPrimary}>
            <Plus size={16} strokeWidth={2.6} /> Nuevo hilo
          </button>
        </header>

        <div className={academia.comFilters}>
          {categories.map((c) => (
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

        <section className={academia.comList}>
          {threads.map((t) => (
            <article key={t.id} className={academia.comThread}>
              <span className={academia.comThreadIcon}>
                {t.pinned ? <Pin size={17} /> : <MessagesSquare size={17} />}
              </span>
              <div className={academia.comThreadBody}>
                <span className={academia.comThreadTitle}>{t.title}</span>
                <span className={academia.comThreadMeta}>
                  {t.author} · {t.category} · última respuesta {t.last}
                </span>
              </div>
              <span className={academia.comThreadReplies}>
                <MessageCircle size={14} /> {t.replies}
              </span>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
