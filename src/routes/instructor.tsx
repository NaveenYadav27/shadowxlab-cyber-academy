import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/instructor")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Instructor Console" },
      {
        name: "description",
        content:
          "Instructor controls for session attendance, syllabus metrics and course administration.",
      },
      { property: "og:title", content: "ShadowXLab | Instructor Console" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="instructor" />,
});
