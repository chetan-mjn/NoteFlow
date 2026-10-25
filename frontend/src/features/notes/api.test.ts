import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createNote,
  deleteNote,
  getNote,
  listNotes,
  login,
  register,
  updateNote,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Note Flow API client", () => {
  it("registers using the backend JSON request shape", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ user_id: 4, username: "Alex Morgan", email: "alex@example.com" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await register("Alex Morgan", "alex@example.com", "password123");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          username: "Alex Morgan",
          email: "alex@example.com",
          password: "password123",
        }),
      }),
    );
  });

  it("sends the email in the OAuth2 form username field and extracts the token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ access_token: "jwt-value", token_type: "bearer" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(login("alex@example.com", "password123")).resolves.toBe("jwt-value");

    const [, options] = fetchMock.mock.calls[0]!;
    expect(new Headers(options?.headers).get("Content-Type")).toBe(
      "application/x-www-form-urlencoded",
    );
    expect(options?.body).toBeInstanceOf(URLSearchParams);
    expect((options?.body as URLSearchParams).get("username")).toBe("alex@example.com");
    expect((options?.body as URLSearchParams).get("password")).toBe("password123");
  });

  it("uses the note paths, query parameters, and Bearer token for CRUD", async () => {
    const note = {
      note_id: 12,
      title: "A note",
      content: "Note content",
      owner_id: 4,
      created_at: "2026-10-15T10:00:00",
      updated_at: "2026-10-15T10:00:00",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json([note]))
      .mockResolvedValueOnce(Response.json(note))
      .mockResolvedValueOnce(Response.json(note))
      .mockResolvedValueOnce(Response.json(note))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      listNotes(
        {
          skip: 10,
          limit: 10,
          search: "meeting notes",
          sort_by: "updated_at",
          order: "desc",
        },
        "jwt-value",
      ),
    ).resolves.toEqual([note]);
    await expect(getNote(12, "jwt-value")).resolves.toEqual(note);
    await expect(
      createNote({ title: note.title, content: note.content }, "jwt-value"),
    ).resolves.toEqual(note);
    await expect(
      updateNote(12, { title: "Updated", content: note.content }, "jwt-value"),
    ).resolves.toEqual(note);
    await expect(deleteNote(12, "jwt-value")).resolves.toBeUndefined();

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:8000/notes/?skip=10&limit=10&sort_by=updated_at&order=desc&search=meeting+notes",
      "http://localhost:8000/notes/12",
      "http://localhost:8000/notes/",
      "http://localhost:8000/notes/12",
      "http://localhost:8000/notes/12",
    ]);
    expect(
      fetchMock.mock.calls.every(
        ([, options]) => new Headers(options?.headers).get("Authorization") === "Bearer jwt-value",
      ),
    ).toBe(true);
    expect(fetchMock.mock.calls.map(([, options]) => options?.method ?? "GET")).toEqual([
      "GET",
      "GET",
      "POST",
      "PATCH",
      "DELETE",
    ]);
  });

  it("surfaces backend error details and status codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ detail: "Username or email already exists" }, { status: 409 }),
        ),
    );

    await expect(register("Alex Morgan", "alex@example.com", "password123")).rejects.toMatchObject({
      name: "ApiError",
      message: "Username or email already exists",
      status: 409,
    });
  });
});
