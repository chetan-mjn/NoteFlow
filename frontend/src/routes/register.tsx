import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/features/notes/auth-form";
export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account · Note Flow" },
      { name: "description", content: "Make room for your thoughts with a Note Flow workspace." },
      { property: "og:title", content: "Create an account · Note Flow" },
      {
        property: "og:description",
        content: "A fresh page awaits. Start your Note Flow workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Register,
});
function Register() {
  return <AuthForm register />;
}
