import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Layers2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  getApiErrorMessage,
  login as loginRequest,
  register as registerRequest,
} from "./api";
import { useAuth } from "./auth";

export function AuthForm({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const { signIn, sessionExpired } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    try {
      if (register) {
        const username = String(data.get("username") ?? "").trim();
        await registerRequest(username, email, password);
        setSuccess("Your account is ready. Sign in to open your notes.");
      } else {
        signIn(await loginRequest(email, password));
        await navigate({ to: "/", replace: true });
      }
    } catch (cause) {
      const message = getApiErrorMessage(cause, "Something went wrong. Please try again.");
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "That username or email is already registered."
          : cause instanceof ApiError && cause.status === 401
            ? "That email and password do not match."
            : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <Layers2 />
        </span>
        Note Flow<span className="brand-dot">.</span>
      </Link>
      <div className="auth-form-wrap">
        <span className="eyebrow">YOUR OWN LITTLE SPACE</span>
        <h1>{register ? "A fresh page awaits." : "Welcome back."}</h1>
        <p className="auth-intro">
          {register ? "Make room for your thoughts." : "Let’s pick up where you left off."}
        </p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Full name
              <input
                name="username"
                required
                minLength={3}
                maxLength={100}
                autoComplete="name"
                placeholder="Alex Morgan"
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              minLength={8}
              maxLength={122}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={20}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder="8 to 20 characters"
            />
          </label>
          {sessionExpired && !register && (
            <p className="editor-notice" role="status">
              Your session expired. Please sign in again.
            </p>
          )}
          {error && (
            <p className="editor-notice" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="editor-notice" role="status">
              {success}
            </p>
          )}
          <Button size="lg" type="submit" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            <ArrowRight />
          </Button>
        </form>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to Note Flow?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <p className="demo-notice">Your notes are private to your account.</p>
      </div>
      <footer>Note Flow · A clearer mind starts with a note.</footer>
    </main>
  );
}
