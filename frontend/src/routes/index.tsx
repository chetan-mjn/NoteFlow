import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/notes/dashboard";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your notes · Note Flow" },
      {
        name: "description",
        content:
          "Bring your thoughts together. Browse, search, and organize your personal notes in Note Flow.",
      },
      { property: "og:title", content: "Your notes · Note Flow" },
      { property: "og:description", content: "A calm, clear workspace for your notes and ideas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
