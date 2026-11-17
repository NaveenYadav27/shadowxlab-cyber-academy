# Day 1 UI Design Specification

## Design intent and constraints

Extend the existing ShadowXLab interface rather than replacing it. Preserve the fixed sidebar, top header, programme context, current dashboard, and responsive mobile dock. The existing design source is `src/styles.css`: dark navy surfaces, semantic cyan/turquoise tokens, fine borders, restrained glow, compact technical type, reduced-motion handling, and breakpoints at 1150px and 760px. Use these tokens and existing Button/Input/Card patterns; do not introduce a parallel theme or hard-coded colors.

No institutional label or imagery should be introduced. Use existing ShadowXLab brand assets only. Do not alter the Day 2–Day 5 presentation.

## Navigation and information architecture

- Keep existing sidebar entries and labels exactly as currently implemented.
- Keep the existing `Schedule` view as the entry for selecting Day 1; a selected session opens within that view or a clearly linked learning panel, not a new top-level navigation engine.
- `Learning Modules` may provide a cross-session concept index, but should remain backed by the same Day 1 curriculum IDs and learning state.
- Dashboard Day 1 schedule links must select Day 1 and focus the selected session.
- Lab links open the selected lab within the existing `Virtual Lab` view while preserving `dayId`, `sessionId`, and `labId` context.
- Progress view adds Day 1 concept and assessment measures without removing current session progress.

## Schedule expansion

Retain the current day tabs, session order, times, types, and descriptions. Each session row gains:

- A stable, accessible expand/collapse control with expanded state.
- Existing session title, type, time, and completion indicator.
- An expanded panel with `n / 12 concepts`, session assessment state, and a “Continue learning” action.
- Twelve ordered concept rows with number, title, duration, prerequisite status, completion status, and a clear open action.
- Lab badge and “Open simulated lab” action only when referenced by that session.

At desktop widths, keep the existing schedule content width and table-like alignment. At mobile widths, stack time and status above the title; place actions below the wrapped title. Do not force a horizontal scroller for the actual learning content.

## Concept learning view

A concept opens in the existing workspace rather than a separate microsite. Layout at desktop:

```text
Session identity / 01 of 12                     Progress 05 / 12
Concept navigation | Main content                 Context rail
Previous         Title, objectives                Lab linkage
Concept list     Explanation and workflow          Prerequisites
                Enterprise example                 Check status
                Security relevance                  [Complete / check]
                Instructor note                     Next concept
```

- Use a compact session breadcrumb, current concept number, title, and duration.
- Show objectives in a short scannable list before technical explanation.
- Put workflow, example, security relevance, instructor note, mistakes, check objectives, and diagram specification in semantic sections. Preserve full text; do not collapse mandatory material behind inaccessible controls.
- The diagram area may be a simple semantic rendered diagram or described illustration; do not claim a missing bitmap exists. It must have a text equivalent.
- Previous/next buttons are stable in size and disabled at boundaries; concept index navigation remains keyboard operable.
- Completion action states are `Not started`, `In progress`, `Complete`, and `Needs review`. A completion state is not communicated by color alone.
- On narrow screens, use a single column; concept navigation collapses to an accessible selector or disclosure. Keep progress and “Next” action reachable without obscuring text.

## Lab interface

Extend the existing Virtual Lab page and current simulated topology, controls, instructions, and checklists. Do not suggest that the topology currently executes traffic. Add a structured lab shell:

- Lab identity, session linkage, time estimate, reset action, and prominent “SIMULATION ONLY” state.
- Scenario and starting state before interactive controls.
- Topology/data panel; task list; deterministic controls and fixture traffic; validation results; score/evidence panel.
- Each task reports expected behavior, observed simulated behavior, pass/fail, and explanation. Learner can retry or reset.
- The footer must say no real devices, packets, hosts, or VMs are involved.
- A reset clears this lab attempt's transient configuration, not curriculum or unrelated learner progress.
- Keep contrast and touch-target sizes consistent with existing controls. At mobile widths, stack topology, task list, then results.

## Assessment interface

- Show type, session/concept scope, number of questions, pass threshold, attempts remaining, and privacy/saving status before starting.
- Use a stepper and progress count, not a wall of questions; keep response controls accessible and keyboard navigable.
- Do not reveal correct options or answer rationale before final submission. After submission, show correct answer, explanation, concept reference, and retry eligibility.
- For multi-select, state whether partial credit applies; for ordering or short response, state scoring rubric before response.
- On save failure, preserve the response locally only where safe and show “Not synced” rather than success.

## Progress and instructor panels

Learner progress adds a Day 1 breakdown with concept completion, session assessment results, lab pass state, and final assessment state. Each percentage states its denominator. Empty progress shows 0 of configured total, not a prefilled earned value. Instructor Console shows per-authorized-learner summary, attempts, completion, and lab submissions; never expose another learner's records to a learner role.

## Component hierarchy and code integration target

These are proposed responsibilities, not names already present in the repository. Reuse current `ScheduleView`, `ModulesView`, `LabView`, `AssessmentsView`, `ProgressView`, current shared `Card`, `SectionHeading`, `Button`, and state container in `src/components/training-platform-app.tsx`; keep curriculum types/data centralized in `src/lib/training-platform.ts`. If the file becomes unwieldy, extract focused view modules while preserving a single data model and document the structural choice in root `AGENTS.md` before code implementation.

```text
TrainingPlatformApp (existing)
├── ScheduleView (existing; extend)
│   └── DaySessionAccordion (proposed)
│       ├── SessionConceptList (proposed)
│       └── SessionAssessmentStatus (proposed)
├── ConceptLearningPanel (proposed)
│   ├── ConceptNavigator (proposed)
│   ├── ConceptArticle (proposed)
│   └── ConceptCheck (proposed)
├── LabView (existing; extend)
│   ├── LabScenarioPanel (proposed)
│   ├── SimulationWorkspace (existing topology/control patterns)
│   └── LabValidationPanel (proposed)
├── AssessmentsView (existing; extend)
└── ProgressView / InstructorView (existing; extend)
```

## Interaction states

| Control | Idle | Active | Success | Failure |
| --- | --- | --- | --- | --- |
| Session accordion | Collapsed with session summary | Expanded, `aria-expanded=true` | N/A | Safe inline unavailable state |
| Concept row | Not started | Open/current | Complete with text + icon | Needs review with explanation |
| Lab task | Not attempted | Running deterministic fixture | Passed with evidence | Failed with reason and retry/reset |
| Assessment | Not started | In progress with saved status | Passed and unlocks configured rule | Failed, attempt policy and retry shown |
| Persist action | Saved/ready | Saving, duplicate action disabled | Synced with time | Not synced; retry offered |

## Empty, loading, error, responsive behavior

- Empty Day 1 config: no false “12 concepts” placeholder; report that learning content is not configured and provide an authorized configuration route.
- Loading: reserve layout height, show text labels, preserve selected Day/session.
- Invalid import: identify the field and reject atomically.
- Small screens: test at 320, 375, and 760 CSS px; ensure no clipped titles/buttons, no body-level horizontal overflow, and no hidden “Submit”/“Next” controls.
- Keyboard: tab order follows visible order, accordion uses native button behavior, all inputs are labeled, focus is visible, and score/status updates are announced.
- Reduced motion disables animated topology paths and nonessential transitions.
