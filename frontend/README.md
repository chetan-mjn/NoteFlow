# Note Flow frontend

This TanStack Start frontend uses the FastAPI backend for authentication and notes.

## Local development

1. Start the backend at `http://localhost:8000`.
2. Copy `.env.example` to `.env` in this directory. Change `VITE_API_BASE_URL` if the API is hosted elsewhere.
3. Install frontend dependencies and run the app:

   ```sh
   npm install
   npm run dev
   ```

`VITE_API_BASE_URL` is a public API address, not a secret. Do not put passwords, JWT signing keys, or other credentials in frontend environment variables. JWT access tokens are kept in `sessionStorage` and sent as Bearer tokens for note requests.

The backend must allow the frontend development origin through CORS for browser requests to work. The current backend source does not configure CORS.

## API behavior

Authentication uses `POST /auth/register` with JSON and `POST /auth/login` with form-encoded credentials. The login email is sent in the OAuth2 form's `username` field. Note CRUD, search, sorting, and pagination use the existing `/notes/` API. The frontend intentionally omits categories, pinned notes, trash, and restore because the backend does not persist those features.

Run the frontend checks with `npm test`, `npm run lint`, and `npm run build`.
