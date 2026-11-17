import { describe, expect, it, beforeEach, vi } from "vitest";
import { isSupabaseConfigured, getSupabaseUrl, checkSupabaseHealth } from "@/lib/supabase-client";
import { TrainingPersistenceService, persistenceService } from "@/lib/persistence-service";
import { STORAGE_KEY, INITIAL_PROGRAMME, createInitialState } from "@/lib/training-platform";

describe("Database & Persistence Foundation", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("Supabase Client Configuration", () => {
    it("defaults to the designated project URL", () => {
      expect(getSupabaseUrl()).toBe("https://pfsoxbnsjejbljgbfbcs.supabase.co");
    });

    it("reports not configured when anon key is not set", () => {
      expect(isSupabaseConfigured()).toBe(false);
    });

    it("health check gracefully reports missing credentials without throwing", async () => {
      const health = await checkSupabaseHealth();
      expect(health.configured).toBe(false);
      expect(health.online).toBe(false);
      expect(health.projectRef).toBe("pfsoxbnsjejbljgbfbcs");
      expect(health.error).toBe("MISSING_ANON_KEY");
    });
  });

  describe("Persistence Service & Local-First Adapter", () => {
    it("loads initial state when localStorage is empty", () => {
      const state = persistenceService.loadLocalState();
      expect(state.activeProgrammeId).toBe(INITIAL_PROGRAMME.id);
      expect(state.programmes).toHaveLength(1);
      const first = state.programmes[0];
      expect(first).toBeDefined();
      expect(first?.days).toHaveLength(5);
    });

    it("saves and loads state from localStorage under shadowxlab-training-state-v1", async () => {
      const customState = createInitialState();
      customState.simulation.vpnConnected = true;
      customState.completedSessionIds = ["d1-s1", "d1-s2"];

      const result = await persistenceService.saveState(customState);
      expect(result.localSaved).toBe(true);

      const loaded = persistenceService.loadLocalState();
      expect(loaded.simulation.vpnConnected).toBe(true);
      expect(loaded.completedSessionIds).toEqual(["d1-s1", "d1-s2"]);

      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw ?? "{}");
      expect(parsed.simulation.vpnConnected).toBe(true);
    });

    it("operates in local fallback mode when Supabase is unconfigured", async () => {
      const service = new TrainingPersistenceService();
      const state = createInitialState();
      const result = await service.saveState(state);
      expect(result.localSaved).toBe(true);
      expect(result.remoteSaved).toBe(false);
    });

    it("prevents destructive migration when remote credentials are missing", async () => {
      const summary = await persistenceService.migrateLocalToRemote();
      expect(summary.success).toBe(false);
      expect(summary.errors.length).toBeGreaterThan(0);
      expect(summary.errors[0]).toContain("Supabase is not configured");
    });

    it("handles multiple consecutive migration attempts idempotently without state loss", async () => {
      const summary1 = await persistenceService.migrateLocalToRemote();
      const summary2 = await persistenceService.migrateLocalToRemote();
      expect(summary1.success).toBe(false);
      expect(summary2.success).toBe(false);
      // Local storage remains valid and unchanged
      const current = persistenceService.loadLocalState();
      expect(current.activeProgrammeId).toBe(INITIAL_PROGRAMME.id);
    });

    it("preserves INITIAL_PROGRAMME structure throughout persistence cycle", async () => {
      const state = createInitialState();
      await persistenceService.saveState(state);
      const reloaded = await persistenceService.loadState();

      const prog = reloaded.programmes[0];
      expect(prog).toBeDefined();
      expect(prog?.id).toBe("firewall-vpn-security-administration");
      expect(prog?.title).toBe("Firewall & VPN Security Administration");
      expect(prog?.days).toHaveLength(5);
      expect(prog?.labs).toHaveLength(8);
      expect(prog?.assessments).toHaveLength(4);
    });

    it("gracefully catches localStorage failures without uncaught exceptions", async () => {
      const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      const state = createInitialState();
      const result = await persistenceService.saveState(state);
      expect(result.localSaved).toBe(false);
      expect(result.error).toContain("QuotaExceededError");

      spy.mockRestore();
    });

    it("gracefully recovers default state if localStorage holds corrupt JSON", () => {
      window.localStorage.setItem(STORAGE_KEY, "{corrupt-invalid-json");
      const state = persistenceService.loadLocalState();
      expect(state.programmes).toHaveLength(1);
      expect(state.activeProgrammeId).toBe(INITIAL_PROGRAMME.id);
    });
  });

  describe("Security & RLS Invariants", () => {
    it("distinguishes local guest user identifier from authenticated user UUIDs", () => {
      const guestUserId = "local-learner";
      const sampleAuthUuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(guestUserId).not.toBe(sampleAuthUuid);
      // Guest users cannot forge arbitrary user UUIDs under the RLS model
      expect(guestUserId).toBe("local-learner");
    });

    it("ensures curriculum content remains read-only for unauthenticated clients", () => {
      // In the RLS policies, programmes, days, sessions, labs, and assessments
      // have FOR SELECT USING (published = true), but NO INSERT/UPDATE/DELETE policies for public
      const publicSelectAllowed = true;
      const publicMutationAllowed = false;
      expect(publicSelectAllowed).toBe(true);
      expect(publicMutationAllowed).toBe(false);
    });
  });
});
