import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Programme Schedule" },
      {
        name: "description",
        content:
          "Five-day cybersecurity training timetable, daily timelines and session completions.",
      },
      { property: "og:title", content: "ShadowXLab | Programme Schedule" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="schedule" />,
});
