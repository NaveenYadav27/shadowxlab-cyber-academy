import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { pathToView, viewToPath, type ViewKey } from "@/components/training-platform-app";

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("matches a page for / instead of falling back to not found", () => {
    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.at(-1)?.routeId).toBe("/");
  });

  const routes: { path: string; expectedId: string }[] = [
    { path: "/dashboard", expectedId: "/dashboard" },
    { path: "/programmes", expectedId: "/programmes" },
    { path: "/schedule", expectedId: "/schedule" },
    { path: "/modules", expectedId: "/modules" },
    { path: "/lab", expectedId: "/lab" },
    { path: "/assessments", expectedId: "/assessments" },
    { path: "/resources", expectedId: "/resources" },
    { path: "/progress", expectedId: "/progress" },
    { path: "/instructor", expectedId: "/instructor" },
    { path: "/admin", expectedId: "/admin" },
    { path: "/administration", expectedId: "/administration" },
  ];

  routes.forEach(({ path, expectedId }) => {
    it(`matches first-class route for ${path}`, () => {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId).toBe(expectedId);
    });
  });

  it("defines bijective path-to-view and view-to-path mappings for all views", () => {
    const expectedViews: ViewKey[] = [
      "dashboard",
      "programmes",
      "schedule",
      "modules",
      "lab",
      "assessments",
      "resources",
      "progress",
      "instructor",
      "administration",
    ];

    expectedViews.forEach((view) => {
      const path = viewToPath[view];
      expect(path).toBeDefined();
      expect(pathToView[path]).toBe(view);
    });

    expect(pathToView["/"]).toBe("dashboard");
    expect(pathToView["/admin"]).toBe("administration");
    expect(pathToView["/administration"]).toBe("administration");
  });
});
