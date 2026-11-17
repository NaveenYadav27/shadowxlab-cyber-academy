import { createFileRoute, redirect } from "@tanstack/react-router";

import ShadowXLabApp from "@/components/training-platform-app";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "ShadowXLab | Cybersecurity Training Platform" },
      {
        name: "description",
        content:
          "Manage cybersecurity training programmes, schedules, learning modules, assessments, and simulated labs in ShadowXLab.",
      },
      { property: "og:title", content: "ShadowXLab | Cybersecurity Training Platform" },
      {
        property: "og:description",
        content:
          "A cybersecurity learning and simulation environment for configurable training programmes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ShadowXLabApp currentView="dashboard" />,
});
