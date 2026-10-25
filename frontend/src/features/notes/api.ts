export type Note = {
  note_id: number;
  title: string;
  content: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

export type NoteInput = Pick<Note, "title" | "content">;

export type NoteListQuery = {
  skip: number;
  limit: number;
  search?: string;
  sort_by: "created_at" | "updated_at" | "title";
  order: "asc" | "desc";
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = (import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8000").replace(
  /\/+$/,
  "",
);

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = payload.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return (
        detail
          .map((item) =>
            typeof item === "object" && item !== null && "msg" in item ? String(item.msg) : "",
          )
          .filter(Boolean)
          .join("; ") || fallback
      );
    }
  }
  return fallback;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Could not reach the Note Flow API. Check the API URL and try again.", 0);
  }

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
    throw new ApiError(
      getErrorMessage(payload, `Request failed (${response.status}).`),
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function register(username: string, email: string, password: string) {
  return request<{
    user_id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const result = await request<TokenResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return result.access_token;
}

export function listNotes(query: NoteListQuery, token: string) {
  const params = new URLSearchParams({
    skip: String(query.skip),
    limit: String(query.limit),
    sort_by: query.sort_by,
    order: query.order,
  });
  if (query.search) params.set("search", query.search);
  return request<Note[]>(`/notes/?${params.toString()}`, {}, token);
}

export function getNote(noteId: number, token: string) {
  return request<Note>(`/notes/${noteId}`, {}, token);
}

export function createNote(note: NoteInput, token: string) {
  return request<Note>("/notes/", { method: "POST", body: JSON.stringify(note) }, token);
}

export function updateNote(noteId: number, note: NoteInput, token: string) {
  return request<Note>(`/notes/${noteId}`, { method: "PATCH", body: JSON.stringify(note) }, token);
}

export function deleteNote(noteId: number, token: string) {
  return request<void>(`/notes/${noteId}`, { method: "DELETE" }, token);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
