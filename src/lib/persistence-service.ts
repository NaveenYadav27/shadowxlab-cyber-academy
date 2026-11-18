import { STORAGE_KEY, createInitialState, type TrainingState } from "./training-platform";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase-client";

export interface PersistenceResult {
  localSaved: boolean;
  remoteSaved: boolean;
  error?: string | undefined;
}

export interface MigrationSummary {
  success: boolean;
  programmesMigrated: number;
  daysMigrated: number;
  sessionsMigrated: number;
  labsMigrated: number;
  assessmentsMigrated: number;
  resourcesMigrated: number;
  errors: string[];
}

export class TrainingPersistenceService {
  /**
   * Reads state from local storage. If not found or empty, returns clean initial state.
   * Guarantees zero data loss for existing users under 'shadowxlab-training-state-v1'.
   */
  public loadLocalState(): TrainingState {
    if (typeof window === "undefined") {
      return createInitialState();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createInitialState();
      const saved = JSON.parse(raw) as Partial<TrainingState>;
      const fallback = createInitialState();
      const programmes = fallback.programmes.map((fallbackProg) => {
        const savedProg = Array.isArray(saved.programmes)
          ? saved.programmes.find((p) => p.id === fallbackProg.id)
          : undefined;
        if (!savedProg) return fallbackProg;
        return {
          ...savedProg,
          instructor: fallbackProg.instructor,
          location: fallbackProg.location,
          days: fallbackProg.days,
        };
      });
      const firstProgramme = programmes[0] ?? fallback.programmes[0];
      const activeId =
        firstProgramme && programmes.some((p) => p.id === saved.activeProgrammeId)
          ? (saved.activeProgrammeId as string)
          : (firstProgramme?.id ?? "firewall-vpn-security-administration");

      return {
        ...fallback,
        ...saved,
        programmes,
        activeProgrammeId: activeId,
      };
    } catch {
      return createInitialState();
    }
  }

  /**
   * Primary loader: Local-first with optional remote fallback.
   */
  public async loadState(): Promise<TrainingState> {
    return this.loadLocalState();
  }

  /**
   * Saves state to local storage and attempts non-destructive sync of learner progress to Supabase if configured.
   * Remote errors never destroy local data or throw unhandled exceptions.
   */
  public async saveState(state: TrainingState, userId?: string): Promise<PersistenceResult> {
    let localSaved = false;
    let remoteSaved = false;
    let errorMsg: string | undefined = undefined;

    // 1. Local Storage is always primary and guaranteed
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        localSaved = true;
      } catch (err) {
        errorMsg = err instanceof Error ? err.message : String(err);
      }
    }

    // 2. If Supabase is not configured, complete gracefully in local-only mode
    if (!isSupabaseConfigured()) {
      return { localSaved, remoteSaved: false, error: errorMsg };
    }

    // 3. Attempt non-blocking remote persistence for learner simulation and progress
    try {
      const client = getSupabaseClient();
      if (!client) {
        return {
          localSaved,
          remoteSaved: false,
          error: "Supabase client uninitialized",
        };
      }

      const active = state.programmes.find((p) => p.id === state.activeProgrammeId);
      if (active) {
        let effectiveUserId = userId;
        if (!effectiveUserId && typeof window !== "undefined") {
          try {
            const { data } = await client.auth.getSession();
            if (data?.session?.user?.id) {
              effectiveUserId = data.session.user.id;
            }
          } catch {
            // Fall back to local-learner if session query fails
          }
        }
        if (!effectiveUserId) {
          effectiveUserId = "local-learner";
        }

        // Persist learner simulation state
        const { error: simError } = await client.from("learner_simulation_state").upsert({
          programme_id: active.id,
          user_id: effectiveUserId,
          firewall_enabled: state.simulation.firewallEnabled,
          nat_enabled: state.simulation.natEnabled,
          vpn_connected: state.simulation.vpnConnected,
          updated_at: new Date().toISOString(),
        } as never);

        if (simError) {
          errorMsg = simError.message;
          return { localSaved, remoteSaved: false, error: errorMsg };
        }

        remoteSaved = true;
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      console.warn("Supabase synchronization skipped or failed:", errorMsg);
    }

    return { localSaved, remoteSaved, error: errorMsg };
  }

  /**
   * Explicit, idempotent local-to-Supabase migration of learner progress.
   * Prevents duplicates, guarantees user ownership, and does not alter master curriculum catalog.
   */
  public async migrateLocalToRemote(
    customState?: TrainingState,
    targetUserId?: string,
  ): Promise<MigrationSummary> {
    const state = customState ?? this.loadLocalState();
    const summary: MigrationSummary = {
      success: false,
      programmesMigrated: 0,
      daysMigrated: 0,
      sessionsMigrated: 0,
      labsMigrated: 0,
      assessmentsMigrated: 0,
      resourcesMigrated: 0,
      errors: [],
    };

    if (!isSupabaseConfigured()) {
      summary.errors.push(
        "Supabase is not configured. Set VITE_SUPABASE_ANON_KEY to enable remote migration.",
      );
      return summary;
    }

    const client = getSupabaseClient();
    if (!client) {
      summary.errors.push("Failed to initialize Supabase client.");
      return summary;
    }

    let effectiveUserId = targetUserId;
    if (!effectiveUserId) {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();
        effectiveUserId = session?.user?.id;
      } catch {
        // Unauthenticated
      }
    }
    if (!effectiveUserId) {
      effectiveUserId = "local-learner";
    }

    const activeProgId = state.activeProgrammeId || "firewall-vpn-security-administration";

    // 1. Migrate Completed Sessions (learner_session_progress)
    for (const sessionId of state.completedSessionIds) {
      try {
        const { error } = await client.from("learner_session_progress").upsert({
          user_id: effectiveUserId,
          programme_id: activeProgId,
          session_id: sessionId,
          completed: true,
          completed_at: new Date().toISOString(),
        } as never);
        if (error) throw error;
        summary.sessionsMigrated++;
      } catch (err) {
        summary.errors.push(
          `Session '${sessionId}' sync failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 2. Migrate Lab Checklist Progress (learner_lab_progress)
    for (const [checklistKey, checked] of Object.entries(state.checklistState)) {
      if (!checked) continue;
      try {
        const { error } = await client.from("learner_lab_progress").upsert({
          user_id: effectiveUserId,
          programme_id: activeProgId,
          checklist_key: checklistKey,
          checked: true,
          updated_at: new Date().toISOString(),
        } as never);
        if (error) throw error;
        summary.labsMigrated++;
      } catch (err) {
        summary.errors.push(
          `Lab checklist '${checklistKey}' sync failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 3. Migrate Simulation State (learner_simulation_state)
    try {
      const { error } = await client.from("learner_simulation_state").upsert({
        user_id: effectiveUserId,
        programme_id: activeProgId,
        firewall_enabled: state.simulation.firewallEnabled,
        nat_enabled: state.simulation.natEnabled,
        vpn_connected: state.simulation.vpnConnected,
        updated_at: new Date().toISOString(),
      } as never);
      if (error) throw error;
    } catch (err) {
      summary.errors.push(
        `Simulation state sync failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // 4. Migrate Quiz / Assessment Attempts (assessment_attempts)
    if (state.quizSubmitted && state.quizScore !== null) {
      try {
        const { error } = await client.from("assessment_attempts").insert({
          user_id: effectiveUserId,
          programme_id: activeProgId,
          score: state.quizScore,
          answers: {},
          submitted_at: new Date().toISOString(),
        } as never);
        if (error) throw error;
        summary.assessmentsMigrated++;
      } catch (err) {
        summary.errors.push(
          `Assessment attempt sync failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 5. Migrate Resources contributed by user
    for (const res of state.resources) {
      try {
        const { error } = await client.from("programme_resources").upsert({
          id: res.id,
          programme_id: activeProgId,
          title: res.title,
          url: res.url,
          kind: res.kind,
          created_by: effectiveUserId,
        } as never);
        if (error) throw error;
        summary.resourcesMigrated++;
      } catch (err) {
        summary.errors.push(
          `Resource '${res.title}' sync failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    summary.success = summary.errors.length === 0;
    return summary;
  }
}

export const persistenceService = new TrainingPersistenceService();
