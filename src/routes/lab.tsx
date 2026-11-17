import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Virtual Lab Simulation" },
      {
        name: "description",
        content:
          "Cyber range simulation controls, network topology maps and step-by-step validation checklists.",
      },
      { property: "og:title", content: "ShadowXLab | Virtual Lab Simulation" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="lab" />,
});
