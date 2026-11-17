import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Programme Resources" },
      {
        name: "description",
        content: "Manage and access course reference materials and saved resource links.",
      },
      { property: "og:title", content: "ShadowXLab | Programme Resources" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="resources" />,
});
