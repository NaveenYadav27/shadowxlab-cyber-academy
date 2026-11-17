# Day 1 Acceptance Tests

Run these against the actual app implementation; a written specification alone does not pass them. Use seeded Day 1 IDs, but avoid asserting styling snapshots.

## Curriculum and schedule

- [ ] Load Day 1 and confirm title, supplied day title, and all four session titles, start/end times, order, and kinds match `data/day1-curriculum.json` and the existing seed.
- [ ] Confirm Day 1 shows exactly 48 unique concept IDs, exactly 12 in each session, with no concept from Day 2–Day 5.
- [ ] Confirm every concept references an existing session; every `recommendedLab` ID resolves; all prerequisites resolve; no duplicate IDs or order numbers.
- [ ] Expand/collapse each session by mouse and keyboard; `aria-expanded` and accessible name match the actual state.
- [ ] Open the first, middle, and last concept of each session; next/previous never crosses the session without an explicit session action.
- [ ] Validate import/export round-trip and reject missing fields, wrong counts, duplicate IDs, broken references, malformed dates/times, and out-of-range assessment values atomically.
- [ ] Confirm selected programme/day/session remains stable when navigating from Dashboard → Schedule → concept → Lab → Progress.

## Instructional content

- [ ] For each of 48 concepts, verify objective, technical explanation, workflow, enterprise example, engineering relevance, instructor note, common mistakes, knowledge-check objective, diagram spec, lab link, prerequisites, and duration are present.
- [ ] Verify all 48 concepts stay within supplied Day 1 scope; no external identity, unrelated course, live appliance instruction, or fake integration appears.
- [ ] Confirm long titles and explanation sections wrap at 320px without clipping or page-level horizontal scrolling.
- [ ] Confirm diagram specifications have an equivalent text description and do not imply an unavailable image exists.

## Labs and simulation safety

- [ ] Confirm exactly four named labs and their session/concept references.
- [ ] Verify each lab displays scenario, objectives, environment, topology, initial state, instructions, tasks, expected outcomes, validation, scoring, hints, failure conditions, instructor solution (authorized only), reset, and completion rules.
- [ ] Lab 02: test first-match rule ordering, shadowing, explicit allow/deny, implicit deny, CIDR, protocol, inclusive port range, and malformed-input rejection.
- [ ] Lab 03: test SYN → matching SYN-ACK → ACK; reject wrong tuple/unmatched ACK/unsolicited response; test established reply, FIN, RST, expiry, capacity, and asymmetric path.
- [ ] Lab 04: test each declared pipeline stage; block and review precedence; missing required identity; unknown application; no “review” result becomes allow.
- [ ] Reset returns the selected lab to its declared initial state and does not erase another lab's attempts or programme progress.
- [ ] Visible wording says simulation-only; network inspection confirms no real packet, host, appliance, or VM request is made by lab interactions.

## Assessments

- [ ] Inventory validator confirms 240 concept questions = 5 × 48; 80 session questions = 20 × 4; 40 final questions = 10 × 4 sessions.
- [ ] Every question maps to valid concept/session IDs, valid option/rubric, points, explanation, version, and publication state.
- [ ] Validate each sample answer and explanation in `ASSESSMENTS.md` against its stated correct answer.
- [ ] Learner response payload before submission contains no correct index, answer key, or hidden expected lab result.
- [ ] Correct, incorrect, unanswered, duplicate-submit, retry-limit, multi-select scoring, and final-score rounding behaviors are deterministic.
- [ ] After submission, feedback references the linked concept and honors the configured attempt/publication policy.
- [ ] A failed session assessment does not mark the session complete; configured pass score does.

## Progress, persistence, instructor controls

- [ ] Complete one concept and verify Day 1 numerator increases by exactly one; revisit does not double-count.
- [ ] Attempt incomplete prerequisite and verify no completion; complete prerequisite and retry.
- [ ] Verify zero-concept denominator, all-concepts completion, removed/stale IDs, and edits do not inflate the percentage.
- [ ] Session completion requires the configured concepts, assessment, and required labs; verify each configuration switch.
- [ ] For authenticated persistence, refresh and sign in as the same learner; verify saved concept, attempt, lab, and session data reads back.
- [ ] Verify learner A cannot read or change learner B's records; anonymous `local-learner` is never presented as a unique person.
- [ ] Verify guest and student cannot invoke instructor controls even if a request is crafted directly; instructor scope is explicitly authorized.
- [ ] On failed persistence, show an unsynced status, retain recoverable input where safe, and provide retry. Never display a false saved confirmation.
- [ ] Instructor content and answer key preview is unavailable to learner role; authorized edits produce a version/audit record.

## Regression and responsive behavior

- [ ] Existing programme create/edit/duplicate/archive/select/import/export still works.
- [ ] Existing Day 2–Day 5 titles, dates, sessions, labs, and assessment remain unchanged.
- [ ] Dashboard KPIs, roadmap, topology, and upcoming-session links still derive from programme configuration.
- [ ] Existing route test (`src/test/app-routing.test.tsx`) passes; run all related Vitest tests.
- [ ] Desktop 1280px: schedule expansion, concept panel, lab view, assessment, progress, and instructor view are non-overlapping.
- [ ] Mobile 320px and 375px: no clipped buttons or content, navigation usable, assessment submission reachable, touch controls stable.
- [ ] Keyboard-only: navigation, accordion, concept index, forms, lab tasks, and assessment are operable; focus is visible and status changes are announced.
- [ ] Reduced motion removes nonessential animation; color is never the sole status signal.
- [ ] Build succeeds and browser console has no runtime errors.
