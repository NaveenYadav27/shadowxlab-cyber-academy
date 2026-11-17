# ShadowXLab Day 1 implementation package

## Purpose

This package is a repository-grounded implementation blueprint for expanding the existing ShadowXLab training application with Day 1 learning content. It is specification and curriculum data only; it does not claim that the application features described here have been implemented.

## Start here

1. Read [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) for scope, behavior, completion, and security requirements.
2. Read [UI_DESIGN.md](./UI_DESIGN.md) and [LEARNING_CONTENT.md](./LEARNING_CONTENT.md) for the interface and all 48 instructor-ready concepts.
3. Implement the four deterministic simulated labs from [LABS.md](./LABS.md).
4. Build the assessment behavior from [ASSESSMENTS.md](./ASSESSMENTS.md); keep answer keys out of learner-delivered data.
5. Use [DATA_MODEL.md](./DATA_MODEL.md) to reuse rather than duplicate the inspected schema.
6. Follow [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) and verify [ACCEPTANCE_TESTS.md](./ACCEPTANCE_TESTS.md).
7. Importable curriculum data is in [data/day1-curriculum.json](./data/day1-curriculum.json).

## Audited repository baseline

The inspected application is already a single-route ShadowXLab training dashboard, not a blank repository. `/` is declared by `src/routes/index.tsx`; it mounts `src/components/training-platform-app.tsx`. Programme content and types are centralized in `src/lib/training-platform.ts`; the UI already contains programme management, schedule, day-topic modules, checklist simulation, a four-question quiz, resources, progress, attendance, and administration views. `src/styles.css` contains the dark navy and cyan design tokens and responsive layouts. The current browser state is persisted in localStorage under `shadowxlab-training-state-v1`.

Database setup files define normalized programme and learner tables, an initial seed, row-level policies, and a role table. Their presence does not prove that a remote database is connected or those scripts have been applied. No application auth flow or generated database client is present in the inspected `src/` tree. The screens in the current application are not protected by sign-in. See [DATA_MODEL.md](./DATA_MODEL.md) and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) before any persistent-storage change.

The repository's root `AGENTS.md` reserves database schema changes to Lovable-managed tooling and prohibits hand-editing migration files. Accordingly, this package identifies data requirements and contracts, but does not add or alter SQL migrations.

## Learning package totals

- 1 supplied Day 1 with the existing four timetable sessions.
- 12 concepts per session; exactly 48 total, with objectives, explanation, workflow, enterprise example, instructor notes, common mistakes, checks, diagram instructions, lab links, prerequisites, and time estimates.
- 4 simulated lab specifications.
- Assessment design capacity: 240 concept questions (5 per concept), 80 session questions (20 per session), and 40 final questions (10 per session). Assessment documents provide tested-format requirements and real examples, not a fabricated 360-question question bank.

## Execution notes

Keep Day 2–Day 5 and the existing sidebar/navigation unchanged. Extend the current centralized programme model and current views; do not introduce a second learning or routing engine. Do not change supplied timetable times. Only Day 1's separate learning content, labs, and assessment behavior is in scope. The single scheduled Day 1 lab block is 11:45–13:00; Labs 03 and 04 are self-paced simulations linked to the existing afternoon sessions unless the instructor explicitly schedules additional time. See the assumption register in [PRODUCT_SPEC.md](./PRODUCT_SPEC.md).

## Diagrams

- Learning navigation and learner journey: [PRODUCT_SPEC.md](./PRODUCT_SPEC.md#learning-navigation-and-learner-journey)
- Completion, assessment, and progress workflows: [PRODUCT_SPEC.md](./PRODUCT_SPEC.md#workflow-diagrams)
- Lab execution: [LABS.md](./LABS.md#lab-execution-workflow)
- Existing and proposed data relationships: [DATA_MODEL.md](./DATA_MODEL.md#relationship-diagram)
- Extension architecture: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md#architecture-diagram)

## JSON contract and validation

The curriculum JSON is versioned (`schemaVersion`) and uses stable IDs. Each concept's `sessionId` references a session; each lab's session references and concept IDs must resolve. `recommendedLab` contains lab IDs. Dates use ISO `YYYY-MM-DD`; times use 24-hour `HH:MM`; durations are integer minutes; question counts and pass threshold live under assessment metadata. Validate the package before application import:

```sh
python3 -m json.tool docs/day1/data/day1-curriculum.json >/dev/null
```

This package does not install dependencies, call a remote service, create a route, update the app, or apply a schema change.
