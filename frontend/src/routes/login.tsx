import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/features/notes/auth-form";
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Note Flow" },
      {
        name: "description",
        content: "Welcome back to your Note Flow workspace. A calm space for everyday thoughts.",
      },
      { property: "og:title", content: "Sign in · Note Flow" },
      { property: "og:description", content: "Pick up where you left off in Note Flow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});
function Login() {
  return <AuthForm />;
}
