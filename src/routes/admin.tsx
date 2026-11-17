import { createFileRoute } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ShadowXLab | Administration" },
      {
        name: "description",
        content:
          "Programme identity, configuration export/import, publishing and local data settings.",
      },
      { property: "og:title", content: "ShadowXLab | Administration" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="administration" />,
});
