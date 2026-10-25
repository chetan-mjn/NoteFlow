import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  createNote as createNoteRequest,
  deleteNote as deleteNoteRequest,
  getNote as getNoteRequest,
  getApiErrorMessage,
  listNotes,
  updateNote as updateNoteRequest,
  type Note,
  type NoteInput,
  type NoteListQuery,
} from "./api";
import { useAuth } from "./auth";

const PAGE_SIZE = 10;

type NoteQuery = Pick<NoteListQuery, "search" | "sort_by" | "order">;

type NotesContextValue = {
  notes: Note[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadNotes: (query: NoteQuery) => Promise<void>;
  loadMore: () => Promise<void>;
  getNote: (noteId: number) => Promise<Note>;
  createNote: (note: NoteInput) => Promise<Note>;
  updateNote: (noteId: number, note: NoteInput) => Promise<Note>;
  deleteNote: (noteId: number) => Promise<void>;
  clearError: () => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { token, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryRef = useRef<NoteQuery>({ search: "", sort_by: "updated_at", order: "desc" });
  const requestId = useRef(0);

  const handleError = useCallback(
    (cause: unknown, fallback: string) => {
      if (cause instanceof ApiError && cause.status === 401) signOut(true);
      setError(getApiErrorMessage(cause, fallback));
    },
    [signOut],
  );

  const loadNotes = useCallback(
    async (query: NoteQuery) => {
      if (!token) return;
      queryRef.current = query;
      const currentRequest = ++requestId.current;
      setLoading(true);
      setLoadingMore(false);
      setNotes([]);
      setError(null);
      setHasMore(false);
      try {
        const result = await listNotes({ ...query, skip: 0, limit: PAGE_SIZE }, token);
        if (currentRequest !== requestId.current) return;
        setNotes(result);
        setHasMore(result.length === PAGE_SIZE);
      } catch (cause) {
        if (currentRequest === requestId.current) {
          setNotes([]);
          handleError(cause, "Could not load your notes.");
        }
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    },
    [handleError, token],
  );

  const loadMore = useCallback(async () => {
    if (!token || loadingMore || loading || !hasMore) return;
    const currentRequest = requestId.current;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await listNotes(
        { ...queryRef.current, skip: notes.length, limit: PAGE_SIZE },
        token,
      );
      if (currentRequest !== requestId.current) return;
      setNotes((current) => [...current, ...result]);
      setHasMore(result.length === PAGE_SIZE);
    } catch (cause) {
      if (currentRequest === requestId.current) handleError(cause, "Could not load more notes.");
    } finally {
      if (currentRequest === requestId.current) setLoadingMore(false);
    }
  }, [handleError, hasMore, loading, loadingMore, notes.length, token]);

  const refresh = useCallback(async () => {
    if (token) await loadNotes(queryRef.current);
  }, [loadNotes, token]);

  const getNote = useCallback(
    async (noteId: number) => {
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      setError(null);
      try {
        return await getNoteRequest(noteId, token);
      } catch (cause) {
        handleError(cause, "Could not open this note.");
        throw cause;
      }
    },
    [handleError, token],
  );

  const createNote = useCallback(
    async (note: NoteInput) => {
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      setError(null);
      try {
        const created = await createNoteRequest(note, token);
        await refresh();
        return created;
      } catch (cause) {
        handleError(cause, "Could not create this note.");
        throw cause;
      }
    },
    [handleError, refresh, token],
  );

  const updateNote = useCallback(
    async (noteId: number, note: NoteInput) => {
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      setError(null);
      try {
        const updated = await updateNoteRequest(noteId, note, token);
        await refresh();
        return updated;
      } catch (cause) {
        handleError(cause, "Could not save your changes.");
        throw cause;
      }
    },
    [handleError, refresh, token],
  );

  const deleteNote = useCallback(
    async (noteId: number) => {
      if (!token) throw new Error("Your session has expired. Please sign in again.");
      setError(null);
      try {
        await deleteNoteRequest(noteId, token);
        await refresh();
      } catch (cause) {
        handleError(cause, "Could not delete this note.");
        throw cause;
      }
    },
    [handleError, refresh, token],
  );

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      loading,
      loadingMore,
      hasMore,
      error,
      loadNotes,
      loadMore,
      getNote,
      createNote,
      updateNote,
      deleteNote,
      clearError: () => setError(null),
    }),
    [
      notes,
      loading,
      loadingMore,
      hasMore,
      error,
      loadNotes,
      loadMore,
      getNote,
      createNote,
      updateNote,
      deleteNote,
    ],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error("NotesProvider is required");
  return context;
}
