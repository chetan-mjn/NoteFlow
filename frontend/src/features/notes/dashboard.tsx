import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  Check,
  ChevronDown,
  Layers2,
  LayoutGrid,
  List,
  LogOut,
  Menu,
  MoreHorizontal,
  NotebookPen,
  PanelLeftClose,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "./auth";
import { type Note } from "./api";
import { useNotes } from "./store";

type EditorNote = {
  note_id: number | null;
  title: string;
  content: string;
};

export function Dashboard() {
  const { ready, token, signOut } = useAuth();
  const {
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
    clearError,
  } = useNotes();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"updated" | "oldest" | "title">("updated");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sidebar, setSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editor, setEditor] = useState<EditorNote | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [profile, setProfile] = useState(false);
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorError, setEditorError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    void loadNotes({
      search: searchQuery,
      sort_by: sort === "title" ? "title" : "updated_at",
      order: sort === "oldest" || sort === "title" ? "asc" : "desc",
    });
  }, [ready, token, navigate, loadNotes, searchQuery, sort]);

  function newNote() {
    setEditor({ note_id: null, title: "", content: "" });
    setEditing(true);
    setConfirmDelete(false);
    setEditorError("");
    clearError();
  }

  async function openNote(note: Note) {
    setEditor({ note_id: note.note_id, title: note.title, content: note.content });
    setEditing(false);
    setConfirmDelete(false);
    setEditorError("");
    clearError();
    setEditorBusy(true);
    try {
      const current = await getNote(note.note_id);
      setEditor({ note_id: current.note_id, title: current.title, content: current.content });
    } catch {
      setEditorError("Could not open this note. Please try again.");
    } finally {
      setEditorBusy(false);
    }
  }

  async function save() {
    if (!editor) return;
    const title = editor.title.trim();
    if (title.length < 3 || title.length > 100) {
      setEditorError("Title must be between 3 and 100 characters.");
      return;
    }
    if (editor.content.length < 1 || editor.content.length > 1_000_000) {
      setEditorError("Note content must be between 1 and 1,000,000 characters.");
      return;
    }

    setEditorBusy(true);
    setEditorError("");
    try {
      const data = { title, content: editor.content };
      if (editor.note_id === null) await createNote(data);
      else await updateNote(editor.note_id, data);
      setEditor(null);
    } catch (cause) {
      setEditorError(cause instanceof Error ? cause.message : "Could not save this note.");
    } finally {
      setEditorBusy(false);
    }
  }

  async function removeNote() {
    if (editor?.note_id === null || !editor) return;
    setEditorBusy(true);
    setEditorError("");
    try {
      await deleteNote(editor.note_id);
      setEditor(null);
    } catch (cause) {
      setEditorError(cause instanceof Error ? cause.message : "Could not delete this note.");
    } finally {
      setEditorBusy(false);
    }
  }

  function handleSignOut() {
    signOut();
    void navigate({ to: "/login", replace: true });
  }

  if (!ready || !token) {
    return (
      <main className="empty-state" aria-live="polite">
        <p>{ready ? "Opening sign in…" : "Loading your workspace…"}</p>
      </main>
    );
  }

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {sidebar && <div className="mobile-scrim" onClick={() => setSidebar(false)} />}
      <aside className={`app-sidebar ${sidebar ? "is-open" : ""}`}>
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Layers2 size={21} />
          </span>
          <span className="sidebar-label">
            Note Flow<span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="workspace-label sidebar-label">YOUR WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Notes navigation">
          <Button variant="ghost" className="nav-item nav-active" title="All notes">
            <NotebookPen size={18} />
            <span className="sidebar-label">All notes</span>
            <span className="nav-count sidebar-label">{notes.length}</span>
          </Button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note sidebar-label">
            <h3>A little space for big ideas.</h3>
            <p>
              Capture a thought.
              <br />
              See where it takes you.
            </p>
            <span className="note-flourish">Make room for what matters.</span>
          </div>
          <Button
            variant="ghost"
            className="collapse-button"
            onClick={() => {
              setCollapsed(!collapsed);
              setSidebar(false);
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose />
            <span className="sidebar-label">Collapse sidebar</span>
          </Button>
          <div className="profile-area">
            <Button
              variant="ghost"
              className="profile-button"
              onClick={() => setProfile(!profile)}
              title="Account menu"
            >
              <span className="avatar">NF</span>
              <span className="profile-text sidebar-label">
                <strong>Your account</strong>
                <span>Private workspace</span>
              </span>
            </Button>
            {profile && (
              <div className="profile-popover">
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut />
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              onClick={() => setSidebar(true)}
              aria-label="Open sidebar"
            >
              <Menu />
            </Button>
            <span className="breadcrumb">
              Workspace<span>/</span>
              <strong>All notes</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span />
              Private workspace
            </span>
            <span className="topbar-divider" />
            <span className="avatar small-avatar">NF</span>
          </div>
        </header>

        <main className="notes-main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">A CLEARER MIND, ONE NOTE AT A TIME</div>
              <h1>Your thoughts, in one place.</h1>
              <p>A little structure for everything on your mind.</p>
            </div>
            <Button className="new-note-button" onClick={newNote}>
              <Plus size={18} />
              New Note
            </Button>
          </div>

          <div className="notes-toolbar">
            <div className="notes-tabs">
              <Button variant="ghost" className="active-tab" onClick={() => setSearch("")}>
                All notes<span>{notes.length}</span>
              </Button>
              <span className="toolbar-caption">
                {searchQuery ? "Search results" : "A space to think out loud"}
              </span>
            </div>
            <div className="toolbar-controls">
              <label className="search-field">
                <Search size={17} />
                <input
                  aria-label="Search notes"
                  placeholder="Search your notes..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X />
                  </Button>
                )}
              </label>
              <label className="sort-field" title="Sort notes">
                <ArrowDownWideNarrow size={17} />
                <select
                  aria-label="Sort notes"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as typeof sort)}
                >
                  <option value="updated">Last updated</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title A–Z</option>
                </select>
                <ChevronDown size={13} />
              </label>
              <div className="view-switch">
                <Button
                  variant="ghost"
                  size="icon"
                  className={view === "grid" ? "selected-view" : ""}
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  title="Grid view"
                >
                  <LayoutGrid />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={view === "list" ? "selected-view" : ""}
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  title="List view"
                >
                  <List />
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="editor-notice" role="alert">
              {error}
              <Button
                variant="ghost"
                onClick={() =>
                  void loadNotes({
                    search: searchQuery,
                    sort_by: sort === "title" ? "title" : "updated_at",
                    order: sort === "oldest" || sort === "title" ? "asc" : "desc",
                  })
                }
              >
                Try again
              </Button>
            </div>
          )}

          <div className="collection-caption">
            <span>{searchQuery ? "SEARCH RESULTS" : "YOUR COLLECTION"}</span>
            <span>
              {notes.length} note{notes.length === 1 ? "" : "s"} loaded
            </span>
          </div>

          {loading && notes.length === 0 ? (
            <div className="empty-state" role="status">
              <p>Loading your notes…</p>
            </div>
          ) : (
            <div className={`notes-collection ${view === "list" ? "list-view" : ""}`}>
              {notes.map((note) => (
                <article className="note-card" key={note.note_id}>
                  <div className="card-top">
                    <span className="date-dot" />
                  </div>
                  <button
                    className="note-open-area"
                    type="button"
                    aria-label={`Open ${note.title}`}
                    onClick={() => void openNote(note)}
                  >
                    <h2>{note.title}</h2>
                    <p className="note-preview">{note.content}</p>
                  </button>
                  <div className="card-footer">
                    <span>
                      <span className="date-dot" />
                      {new Date(note.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Open ${note.title}`}
                      title="Open note"
                      onClick={() => void openNote(note)}
                    >
                      <MoreHorizontal size={17} />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && notes.length === 0 && (
            <div className="empty-state">
              <NotebookPen size={36} />
              <h2>{searchQuery ? "No notes found" : "A fresh page."}</h2>
              <p>
                {searchQuery
                  ? "Try a different word or a shorter search."
                  : "There’s room for your next thought here."}
              </p>
              {!searchQuery && (
                <Button onClick={newNote}>
                  <Plus />
                  New Note
                </Button>
              )}
            </div>
          )}

          {hasMore && (
            <div className="load-more">
              <Button variant="ghost" onClick={() => void loadMore()} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more notes"}
              </Button>
            </div>
          )}

          <footer className="notes-footer">
            <span>
              <Layers2 size={14} />
              Thoughts become clearer when you write them down.
            </span>
            <span>
              Made for a little more headspace
              <ArrowUpRight size={13} />
            </span>
          </footer>
        </main>
      </div>

      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="editor-dialog">
          <DialogTitle>
            {editor?.note_id === null ? "A new thought" : editing ? "Edit note" : "Your note"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "A little room for what’s on your mind."
              : "Take a moment. Pick up where you left off."}
          </DialogDescription>
          {editor && (
            <>
              {editorBusy && <p role="status">Saving or loading your note…</p>}
              <input
                className="editor-title"
                aria-label="Note title"
                placeholder="Give your thought a title"
                readOnly={!editing}
                minLength={3}
                maxLength={100}
                value={editor.title}
                onChange={(event) => setEditor({ ...editor, title: event.target.value })}
              />
              <textarea
                className="editor-content"
                aria-label="Note content"
                placeholder="Start writing..."
                readOnly={!editing}
                maxLength={1_000_000}
                value={editor.content}
                onChange={(event) => setEditor({ ...editor, content: event.target.value })}
              />
              {editorError && (
                <p className="editor-notice" role="alert">
                  {editorError}
                </p>
              )}
              {confirmDelete ? (
                <div className="delete-confirm">
                  <p>This will permanently delete the note. This action can’t be undone.</p>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                    disabled={editorBusy}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void removeNote()}
                    disabled={editorBusy}
                  >
                    Delete note
                  </Button>
                </div>
              ) : (
                <div className="editor-actions">
                  {editor.note_id !== null && (
                    <Button
                      variant="ghost"
                      onClick={() => setConfirmDelete(true)}
                      disabled={editorBusy}
                    >
                      <Trash2 />
                      Delete
                    </Button>
                  )}
                  <span className="editor-word-count">
                    {editor.content.trim() ? editor.content.trim().split(/\s+/).length : 0} words
                  </span>
                  {editing ? (
                    <Button onClick={() => void save()} disabled={editorBusy}>
                      <Check />
                      {editorBusy ? "Saving…" : "Save note"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setEditing(true);
                        setEditorError("");
                      }}
                      disabled={editorBusy}
                    >
                      <Pencil />
                      Edit note
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
