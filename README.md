# Note Flow

Note Flow is a personal note-taking application with a FastAPI backend and a
React frontend built with TanStack Start, TypeScript, and Tailwind CSS. The
frontend uses the API for registration, login, and note data.

## Features

- Register an account and sign in with email and password
- Authenticate note requests with JWT Bearer tokens
- Create, list, retrieve, edit, and permanently delete notes
- Search notes by title or content
- Sort notes by title or update time
- Load notes in pages
- Responsive notes dashboard with grid and list views

Categories, pinned notes, trash and restore, collaboration, real-time editing,
version history, and AI summarization are not currently implemented by the
backend API.

## Project structure

```text
app/                 FastAPI application
  core/              Settings and JWT/password utilities
  database/          SQLAlchemy engine and session dependency
  models/             SQLAlchemy user and note models
  routers/            Authentication and note endpoints
  schemas/            Pydantic request/response models
alembic/              Database migration configuration and revisions
frontend/             TanStack Start frontend
docker-compose.yaml   MySQL database service
```

## Requirements

- Python 3.10 or newer (the backend uses Python 3.10 union type syntax)
- Node.js 20 or newer and npm
- MySQL 8
- Docker Compose, if running MySQL with the supplied Compose file

## Local development

### 1. Configure the database and backend

Create a `.env` file in the repository root. The backend settings require these
variables:

```dotenv
DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
JWT_SECRET_KEY=
JWT_EXPIRATION_TIME=
JWT_ALGORITHM=
```

Use your own local database credentials and a strong random JWT signing key.
Do not commit `.env` files or put backend secrets in frontend variables. The
JWT expiration is configured in minutes by the backend setting.

The supplied Compose file starts **only MySQL**. It publishes the database on
host port `3307` and reads `DATABASE_ROOT_PASSWORD`, `DATABASE_NAME`,
`DATABASE_USER`, and `DATABASE_PASSWORD` from the environment or root `.env`.
The backend, when run on the host, should connect to `localhost:3307`.

Start MySQL from the repository root:

```sh
docker compose up -d db
```

Create and activate a Python virtual environment, then install backend
requirements. In PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Login dependency note:** The login route uses FastAPI's
`OAuth2PasswordRequestForm`, which requires `python-multipart`. That package is
not listed in the current `requirements.txt`. A fresh environment may need
`python-multipart` added to the backend dependencies before the application
can start successfully.

After the database is available and configured, apply the schema migration:

```sh
alembic upgrade head
```

Run the API from the repository root:

```sh
uvicorn app.main:app --reload --port 8000
```

When it is running, interactive API documentation is available at
`http://localhost:8000/docs`.

### 2. Configure and run the frontend

In another terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend reads `VITE_API_BASE_URL` from `frontend/.env`; it defaults to
`http://localhost:8000`. Change it if the API uses another URL. This is a
public API address, not a secret. Values with the `VITE_` prefix are exposed
to browser code; do not put passwords, JWT keys, or credentials there.

The frontend keeps the JWT in browser `sessionStorage` for the current tab
session and sends it as a Bearer token on note requests. Signing out removes
the local token; the backend does not provide a token-revocation endpoint.

### CORS and browser access

The current FastAPI application does not configure CORS. A browser frontend
served from a different origin may therefore be blocked from calling the API.
Before testing in a browser, configure the backend to allow the exact frontend
origin, or use a same-origin development proxy. The frontend API URL alone
does not configure CORS.

## API overview

All paths below are relative to the API base URL.

| Method | Path | Request | Success response |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | JSON: `username`, `email`, `password` | User object |
| `POST` | `/auth/login` | Form data: `username` (email), `password` | `access_token`, `token_type` |
| `POST` | `/notes/` | JSON: `title`, `content` | Created note |
| `GET` | `/notes/` | Query parameters below | Array of notes |
| `GET` | `/notes/{note_id}` | Integer note ID | Note |
| `PATCH` | `/notes/{note_id}` | JSON with `title` and/or `content` | Updated note |
| `DELETE` | `/notes/{note_id}` | Integer note ID | `204 No Content` |

All note endpoints require:

```http
Authorization: Bearer <access_token>
```

The notes list accepts:

| Query parameter | Default | Description |
| --- | --- | --- |
| `skip` | `0` | Number of matching notes to skip; must be non-negative |
| `limit` | `10` | Page size; must be between 1 and 100 |
| `search` | None | Case-insensitive substring search in title and content |
| `sort_by` | `created_at` | `created_at`, `updated_at`, or `title` |
| `order` | `desc` | `asc` or `desc` |

The list response is a plain array and does not include a total count or page
metadata. Note data contains `note_id`, `title`, `content`, `owner_id`,
`created_at`, and `updated_at`. Users can only list their own notes; detail,
update, and delete requests also check note ownership.

Registration requires a username of 3–100 characters, an email string of
8–122 characters, and a password of 8–20 characters. The login form uses
`username` for the email address, not a JSON `email` field.

## Tests and checks

Frontend checks are run from `frontend/`:

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Frontend API tests mock HTTP responses; they do not verify a live backend,
database, or browser CORS behavior. No backend automated test suite is
currently included in the repository.

## Current limitations

- CORS must be configured before cross-origin browser integration.
- Login depends on `python-multipart`, which is not currently declared in the
  backend requirements.
- Note request and response schemas have inconsistent content limits and
  nullability; empty or null content may be accepted by a request schema but
  fail response validation.
- There is no refresh-token, logout/revocation, or current-user profile
  endpoint.
- Backend endpoint behavior has not been integration-tested by the frontend
  test suite.
