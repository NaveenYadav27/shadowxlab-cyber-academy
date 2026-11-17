import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/programmes")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Programme Management" },
      {
        name: "description",
        content:
          "Build, configure and manage learning programmes from reusable configuration data.",
      },
      { property: "og:title", content: "ShadowXLab | Programme Management" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="programmes" />,
});
