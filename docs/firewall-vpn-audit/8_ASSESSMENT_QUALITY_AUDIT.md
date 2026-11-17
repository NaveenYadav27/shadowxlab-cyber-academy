# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 8: Assessment Quality & Pedagogical Rigor Audit

This audit evaluates the testing mechanisms used to verify student comprehension and technical competency across the curriculum.

---

## 1. Assessment Quality Evaluation

### Day 1 Assessment Bank (`src/data/day1-assessment-bank.json`)
- **Inventory**: 240 Concept Check questions, 80 Session Assessment questions (20/session), 40 Final Examination questions. Total: **360 Questions**.
- **Strengths**:
  1. **Strict Concept Mapping**: Every question explicitly maps to a numbered concept ID (`cc-day1-concept-XX-Y`).
  2. **Technical Distractors**: Distractors are technically plausible (e.g. confusing TCP flags, matching wrong RFC numbers, mistaking egress for ingress).
  3. **Comprehensive Explanations**: Every question includes a detailed pedagogical explanation citing exact protocol behavior and failure modes.
  4. **Points & Thresholds**: Standardized 10 points per question with an industry-standard 70% passing bar.

### Days 2–5 Assessment Deficit (CRITICAL GAP)
- **Current State**:
  - The repository has **ZERO dedicated questions** for Days 2, 3, 4, and 5.
  - The only questions present are the 4 legacy mock questions in `seedProgramme.assessments` (`q1`, `q2`, `q3`, `q4`).
  - Example of superficial question: `q3: "Which item belongs to the VPN topics in this programme? A: IPsec, B: Smurfing only, C: Packet shaping"`. This is trivial memorization and does not evaluate engineering ability.

---

## 2. Industry Standard Practical Assessment Framework

To ensure students cannot pass through memorization alone, the assessment engine must enforce a dual-gate evaluation:

### Gate 1: Scenario-Based Multiple Choice (70% Weight)
- Questions must be presented as enterprise break-fix or architecture scenarios:
  - *Scenario*: "A security administrator notices that internal hosts can ping `192.168.100.20` in the DMZ, but when the DMZ web server attempts to query internal database `192.168.50.25:5432`, the connection is dropped. Inspect the pfSense rule table and identify which rule is missing."
  - *Distractor Quality*: Distractors must represent common administrative misconfigurations (e.g., adding rule to the wrong interface tab, forgetting return traffic state mechanics, using NAT instead of route).

### Gate 2: Hands-On Evidence Submission (30% Weight)
- Labs cannot be marked complete by merely clicking a checkbox.
- Students must submit deterministic CLI output or diagnostic hashes:
  - Example: `ip a show eth0` output matching `192.168.50.10x` lease.
  - Example: `curl -I http://10.0.2.15:80` returning `HTTP/1.1 200 OK` across port-forwarding.
  - Example: OpenVPN client log displaying `Initialization Sequence Completed`.
- The instructor console reviews submitted evidence before issuing completion certificates.
