import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/assessments")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Knowledge Assessments" },
      {
        name: "description",
        content: "Curriculum concept evaluations with real-time scoring and validation.",
      },
      { property: "og:title", content: "ShadowXLab | Knowledge Assessments" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="assessments" />,
});
