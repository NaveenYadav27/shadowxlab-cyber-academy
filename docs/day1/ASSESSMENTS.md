# Day 1 Assessment Specification

## Inventory and mapping

- **Concept checks:** 240 items total, five per each of the 48 concept IDs.
- **Session assessments:** 80 items total, 20 per each of the four supplied session IDs.
- **Day 1 final:** 40 items total, ten per session, with concept coverage distributed across that session's 12 concepts.
- Initial pass threshold: 70%, matching the existing programme seed, configurable per programme.
- The JSON records these counts and stable session/concept IDs. This package includes authored sample questions below; it does not claim to include a reviewed 360-question production bank. The remaining bank-authoring and instructor review is a content task, not a reason to fill the bank with generated placeholders.

## Formats and scoring

| Format | Concept check | Session | Final | Scoring requirement |
| --- | --- | --- | --- | --- |
| Single-best-answer | Yes | Yes | Yes | Exact correct option; one point or normalized weight. |
| Multi-select | Yes | Yes | Yes | State exact-match or partial-credit rule before start; no undisclosed negative marking. |
| Ordered sequence | When concept supports it | Yes | Yes | Correct order rubric; partial credit only if explicitly configured. |
| Scenario response | Short response/rubric | Yes | Yes | Instructor-reviewed or deterministic rubric with criteria and audit trail; do not imply automated semantic judgment unless implemented and validated. |

Each question has stable ID, type, prompt, options or response schema, correct-answer key/rubric, explanation, linked concept ID(s), session ID, difficulty, points, publication status, and version. Correct keys remain in a trusted scoring boundary and are omitted from learner response payloads until the attempt is closed.

## Attempt, mastery, retry, and feedback rules

- A learner must have access to the assessment's programme and session; a published assessment is not public just because its course content is public.
- Default attempt limit: 3 per assessment, configurable by an authorized instructor. No hidden unlimited retries. If a pilot chooses unlimited retries, make it explicit and retain all attempts.
- One active attempt per learner and assessment; server assigns attempt number and timestamps. Duplicate submissions are idempotent by attempt ID.
- Score is points earned divided by points possible, rounded to the nearest whole percent. Pass at configured threshold. Store raw answers, score, pass, question version, and submission timestamp. For privacy, do not put answer keys into a browser-visible config or logs.
- Before submission, show selected answers and unanswered items; permit changes until final submit. After submission, show correct answer, explanation, concept link, score, and pass/retry state according to publication policy.
- Mastery for a concept is a passed concept check. Session mastery requires its session test pass; final mastery requires the final threshold. Reattempt results do not erase prior attempts; the programme must declare whether unlock uses latest or best attempt (default: latest attempt for current mastery, retain best as history).
- Do not mark a session complete on assessment submission alone if required concepts/lab tasks remain incomplete.

## Assessment workflows

### Concept check

One five-question pool is assigned to each concept. Each check draws questions from that concept's own five authored items. For predictable grading in the first version, use all five in a stable order or a reproducible selection keyed to attempt; never present the answer key in the learner's initial payload. Minimum score and retry rule are configured.

### Session assessment

Each session has 20 authored items mapped to its 12 concepts. A delivered assessment can use a declared deterministic selection (e.g. 10 of 20) only if the product supports it and the instructor knows the selection rule. The question-bank inventory remains 20 per session regardless of delivery length. For initial implementation, deliver all 20 in the authored order to avoid ambiguous randomization.

### Final assessment

The 40-item bank contains ten items from each session. Deliver all 40 for the first version. Report results by session/concept cluster only after submission. A passing final does not bypass programme completion rules or required lab completion.

## Concrete sample items and answer keys

These samples are authored against the supplied Day 1 scope. Keep answers hidden until submission in the actual learner flow.

### Concept check samples

**C1 — Threat, vulnerability, exploit, and risk (single best answer).** A device has a documented weakness, but the device is on an isolated training subnet and no exploit evidence is present. Which conclusion is best supported?  
A. The system is confirmed compromised.  
B. A vulnerability exists; exposure and risk still require context.  
C. The threat actor is identified.  
D. The weakness is an exploit.  
**Answer: B.** A weakness is not evidence of exploitation; reachability, impact, and compensating controls inform risk.

**C2 — IPv4 prefix (single best answer).** Which network contains `10.24.8.37/24`?  
A. `10.24.8.0/24`  B. `10.24.0.0/24`  C. `10.24.8.37/32`  D. `10.24.9.0/24`  
**Answer: A.** The first 24 bits identify `10.24.8.0/24`.

**C3 — TCP endpoint (single best answer).** In a client flow to a documented HTTPS listener, which field normally identifies the server's requested service endpoint?  
A. Client ephemeral source port  B. Destination TCP port 443  C. Client MAC address  D. Firewall rule order  
**Answer: B.** Destination transport port is the service endpoint hint; it does not prove the application identity.

**C4 — Stateful inspection (single best answer).** Why can a stateful policy admit a matching reply without a broad server-to-client allow rule?  
A. The reply's source address is trusted by default.  B. It matches a previously permitted tracked flow.  C. TCP encrypts the return packet.  D. The port number authenticates the user.  
**Answer: B.** The policy decision is based on tracked exchange context and matching state.

**C5 — NGFW decision (scenario, single best answer).** A fixture is authorized by its network tuple but the required identity context is missing. The policy is configured to require identity. What should the simulator do?  
A. Allow because the port matches.  B. Deny or hold for review according to the declared missing-context policy.  C. Mark identity as verified.  D. Skip every remaining stage.  
**Answer: B.** Network reachability does not satisfy a required identity condition.

### Session assessment samples

**S1 — Session 1, threat mapping (multi-select).** Which fields keep a threat record auditable and useful?  
A. Asset and owner  B. Evidence and confidence  C. Control and verification  D. Unverified actor attribution as fact  
**Answers: A, B, C.** Record facts, uncertainty, ownership, and testable action; do not present unsupported attribution as fact.

**S2 — Session 2, rule engineering (single best answer).** In this lab's first-match model, a broad allow precedes a narrow deny and both match the same flow. Which action applies?  
A. The last matching rule.  B. The first matching rule.  C. Both actions cancel.  D. The implicit deny always applies first.  
**Answer: B.** Evaluation stops at the first fully matching ordered rule.

**S3 — Session 3, stateful flow (sequence).** Order the simplified handshake: `SYN`, `SYN-ACK`, `ACK`.  
**Answer:** Initiator `SYN` → responder `SYN-ACK` → initiator `ACK`.  
**Explanation:** The declared teaching model transitions to established only after a matching final ACK.

**S4 — Session 4, NGFW (single best answer).** A deterministic inspection fixture returns `review`. The published precedence says review is not allow. What is the outcome?  
A. Allow silently.  B. Review, with stage and reason recorded.  C. Delete the rule.  D. Treat it as a real malware scan.  
**Answer: B.** A simulated review result remains a review outcome and must not be presented as real inspection.

### Day 1 final samples

**F1 — Threat prioritization (single best answer).** Which item should be validated first when deciding whether a management exposure is urgent?  
A. A dramatic alert name alone.  B. Confirmed reachability, asset impact, and evidence.  C. An assumed actor identity.  D. The number of dashboard colors.  
**Answer: B.** Exposure, business impact, and evidence ground prioritization.

**F2 — Rule policy (single best answer).** A required user-to-reporting flow uses TCP/443 to one service. Which rule is most least-privilege?  
A. Any source to any destination, any protocol.  B. User zone to the named service host, TCP destination 443, documented owner.  C. All external hosts to the admin zone.  D. Permit all traffic after one successful test.  
**Answer: B.** Scope should match the documented endpoints and service requirement.

**F3 — Routing and state (scenario, single best answer).** A firewall sees a permitted request but not its reply, which returns through another device. What should be examined first?  
A. Add an any-any reverse rule.  B. Validate both route paths and where session state is observed.  C. Assume the server is compromised.  D. Disable state tracking globally.  
**Answer: B.** Asymmetry can prevent association with the initiating flow; validate architecture before changing scope.

**F4 — NGFW context (multi-select).** Which statements are correct?  
A. A port is not definitive proof of application identity.  B. A missing required identity signal must follow configured policy.  C. A simulator fixture proves a live malware scan occurred.  D. Inspection results need an explainable stage and outcome.  
**Answers: A, B, D.** Port, identity, and inspection evidence have distinct limits; the lab's fixtures are simulation only.

## Validation and acceptance of assessment data

Reject a bank on import if IDs are duplicate; counts do not match 5×48, 20×4, and 10×4; a concept/session reference is missing; correct option is out of range; multi-select has no scoring rule; rubric has no maximum points; published question includes no explanation; or answer keys are included in the learner projection. Run exact inventory checks in content CI or the import validator. Instructor preview should reveal keys only to a verified instructor role. Keep an audit record for edits to question text, key, rubric, and publication state.
