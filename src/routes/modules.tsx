import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/modules")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Learning Modules" },
      {
        name: "description",
        content:
          "Course syllabus topics and learning objectives organized by configured programme days.",
      },
      { property: "og:title", content: "ShadowXLab | Learning Modules" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="modules" />,
});
