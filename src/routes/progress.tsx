import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Learner Progress" },
      {
        name: "description",
        content: "Track programme completion metrics, session progress and course achievements.",
      },
      { property: "og:title", content: "ShadowXLab | Learner Progress" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="progress" />,
});
