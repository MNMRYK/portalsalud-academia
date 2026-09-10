import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AttachmentKind = "image" | "video" | "audio" | "link";

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  url: string;
  name: string;
}

export interface ForumReport {
  id: string;
  postId: string;
  threadId: string;
  reason: string;
  reportedBy: string;
  date: string;
  status: "pending" | "resolved";
}

export interface ForumPost {
  id: string;
  threadId: string;
  author: string;
  isStaff?: boolean;
  body: string;
  date: string;
  attachments: Attachment[];
}

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  pinned?: boolean;
  locked?: boolean;
}

interface ForumContextValue {
  categories: string[];
  threads: ForumThread[];
  posts: ForumPost[];
  reports: ForumReport[];
  pendingReports: ForumReport[];
  postsOf: (threadId: string) => ForumPost[];
  threadById: (id: string) => ForumThread | undefined;
  repliesCount: (threadId: string) => number;
  isReported: (postId: string) => boolean;
  createThread: (input: {
    title: string;
    category: string;
    author: string;
    body: string;
    attachments?: Attachment[];
  }) => string;
  addPost: (input: {
    threadId: string;
    author: string;
    isStaff?: boolean;
    body: string;
    attachments?: Attachment[];
  }) => void;
  deletePost: (postId: string) => void;
  deleteThread: (threadId: string) => void;
  reportPost: (postId: string, reason: string, reportedBy: string) => void;
  resolveReport: (reportId: string) => void;
  addCategory: (name: string) => void;
}

const ForumContext = createContext<ForumContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

const initialCategories = ["Anuncios", "Hábitos", "Recetas", "Dudas"];

const initialThreads: ForumThread[] = [
  {
    id: "t0",
    title: "Normas de la comunidad y cómo participar",
    author: "Equipo Academia",
    category: "Anuncios",
    date: "hace 2 días",
    pinned: true,
  },
  {
    id: "t1",
    title: "¿Cómo organizáis la compra semanal?",
    author: "Elena M.",
    category: "Hábitos",
    date: "hace 5 h",
  },
  {
    id: "t2",
    title: "Recetas de cena rápidas y saciantes",
    author: "Marta R.",
    category: "Recetas",
    date: "hace 1 día",
  },
  {
    id: "t3",
    title: "Dudas sobre la fase 2 del plan",
    author: "Javier P.",
    category: "Dudas",
    date: "hace 3 días",
  },
];

const initialPosts: ForumPost[] = [
  {
    id: "p0",
    threadId: "t0",
    author: "Equipo Academia",
    isStaff: true,
    body: "Bienvenida a la comunidad. Respeto, nada de promoción y ninguna recomendación médica sin supervisión profesional.",
    date: "hace 2 días",
    attachments: [],
  },
  {
    id: "p1",
    threadId: "t1",
    author: "Elena M.",
    body: "Yo dedico el domingo por la mañana a planificar el menú y hago una sola compra. ¿Vosotras cómo lo hacéis?",
    date: "hace 5 h",
    attachments: [],
  },
  {
    id: "p2",
    threadId: "t1",
    author: "Marta R.",
    body: "Te dejo la plantilla que uso para la lista semanal, me salva la vida.",
    date: "hace 4 h",
    attachments: [
      {
        id: "a1",
        kind: "link",
        url: "https://example.com/plantilla-compra",
        name: "Plantilla de compra semanal",
      },
    ],
  },
  {
    id: "p3",
    threadId: "t2",
    author: "Javier P.",
    body: "Yo llevo dos semanas tomando un suplemento que compré por internet y va genial, os paso el enlace de descuento.",
    date: "hoy · 09:12",
    attachments: [],
  },
  {
    id: "p4",
    threadId: "t3",
    author: "Laura G.",
    isStaff: true,
    body: "En la fase 2 se reintroducen los cereales integrales de forma progresiva. Cualquier duda, preguntad aquí.",
    date: "hace 3 días",
    attachments: [],
  },
];

const initialReports: ForumReport[] = [
  {
    id: "r1",
    postId: "p3",
    threadId: "t2",
    reason: "Spam / promoción",
    reportedBy: "Elena M.",
    date: "hoy · 10:04",
    status: "pending",
  },
];

export function ForumProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [threads, setThreads] = useState<ForumThread[]>(initialThreads);
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [reports, setReports] = useState<ForumReport[]>(initialReports);

  const postsOf = useCallback(
    (threadId: string) => posts.filter((p) => p.threadId === threadId),
    [posts],
  );

  const threadById = useCallback(
    (id: string) => threads.find((t) => t.id === id),
    [threads],
  );

  const repliesCount = useCallback(
    (threadId: string) => Math.max(posts.filter((p) => p.threadId === threadId).length - 1, 0),
    [posts],
  );

  const isReported = useCallback(
    (postId: string) =>
      reports.some((r) => r.postId === postId && r.status === "pending"),
    [reports],
  );

  const createThread: ForumContextValue["createThread"] = useCallback((input) => {
    const id = `t${uid()}`;
    setThreads((prev) => [
      {
        id,
        title: input.title,
        author: input.author,
        category: input.category,
        date: "ahora mismo",
      },
      ...prev,
    ]);
    setPosts((prev) => [
      ...prev,
      {
        id: `p${uid()}`,
        threadId: id,
        author: input.author,
        body: input.body,
        date: "ahora mismo",
        attachments: input.attachments ?? [],
      },
    ]);
    return id;
  }, []);

  const addPost: ForumContextValue["addPost"] = useCallback((input) => {
    setPosts((prev) => [
      ...prev,
      {
        id: `p${uid()}`,
        threadId: input.threadId,
        author: input.author,
        isStaff: input.isStaff,
        body: input.body,
        date: "ahora mismo",
        attachments: input.attachments ?? [],
      },
    ]);
  }, []);

  const deletePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setReports((prev) =>
      prev.map((r) => (r.postId === postId ? { ...r, status: "resolved" } : r)),
    );
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    setPosts((prev) => prev.filter((p) => p.threadId !== threadId));
  }, []);

  const reportPost = useCallback(
    (postId: string, reason: string, reportedBy: string) => {
      setPosts((current) => {
        const post = current.find((p) => p.id === postId);
        if (post) {
          setReports((prev) => [
            {
              id: `r${uid()}`,
              postId,
              threadId: post.threadId,
              reason,
              reportedBy,
              date: "ahora mismo",
              status: "pending",
            },
            ...prev,
          ]);
        }
        return current;
      });
    },
    [],
  );

  const resolveReport = useCallback((reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r)),
    );
  }, []);

  const addCategory = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setCategories((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  }, []);

  const value = useMemo<ForumContextValue>(
    () => ({
      categories,
      threads,
      posts,
      reports,
      pendingReports: reports.filter((r) => r.status === "pending"),
      postsOf,
      threadById,
      repliesCount,
      isReported,
      createThread,
      addPost,
      deletePost,
      deleteThread,
      reportPost,
      resolveReport,
      addCategory,
    }),
    [
      categories,
      threads,
      posts,
      reports,
      postsOf,
      threadById,
      repliesCount,
      isReported,
      createThread,
      addPost,
      deletePost,
      deleteThread,
      reportPost,
      resolveReport,
      addCategory,
    ],
  );

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

export function useForum() {
  const ctx = useContext(ForumContext);
  if (!ctx) throw new Error("useForum debe usarse dentro de ForumProvider");
  return ctx;
}
