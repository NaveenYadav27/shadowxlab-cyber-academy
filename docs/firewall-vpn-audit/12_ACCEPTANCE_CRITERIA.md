# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 12: Acceptance Criteria & Enterprise Verification Standards

This document establishes the measurable acceptance gates required to certify any curriculum module or engineering laboratory before student delivery.

---

## 1. Technical Quality Gates

| Verification Gate | Standard | Enforcement Tool | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **Static Type Safety** | Strict TypeScript | `npx tsc --noEmit` | Exactly `0` type errors across all components, lib models, and tests. |
| **Code Style & Formatting** | Prettier & ESLint | `npm run lint` | Exactly `0` errors (standard fast-refresh warnings permissible). |
| **Automated Testing** | Vitest Test Suite | `npm test` | 100% test pass rate across all suites (minimum 72 passing tests). |
| **Production Build** | Nitro + Rolldown | `npm run build` | Clean SSR bundle `.output/server/` and static assets `.output/public/`. |
| **Cloudflare Edge Deploy** | Wrangler Deployment | `npx wrangler deploy` | HTTP 200 on `https://sxl-net.shadowxlab.com` and custom domain triggers. |

---

## 2. Instructional & Pedagogical Acceptance Gates

1. **Deterministic Commands**:
   - Every CLI command presented to students must be copyable with a single click.
   - Commands must specify the target machine (`Kali`, `pfSense Console`, `Ubuntu Server`, or `Host Machine`).
   - Every command must include an explicit "Expected Output" snippet.

2. **Negative Testing & Boundary Verification**:
   - Every security policy lab must include both **positive verification** (traffic that SHOULD be permitted passes) and **negative verification** (traffic that SHOULD be blocked drops cleanly).
   - Example: After creating an HTTP rule for the DMZ, test that SSH or Telnet to the same IP is dropped and logged.

3. **Evidence-Based Completion**:
   - No lab may be marked completed unless the student has provided terminal verification evidence (e.g. `ip a` lease, `curl -I` status, or `ping` statistics).
   - The instructor must retain the authority to verify or reject submitted evidence in the instructor console.

4. **Hardware Graceful Degradation**:
   - If a student cannot run a full 3-VM topology locally, the curriculum must seamlessly provide Mode B (Lightweight), Mode C (Shared Cyber Range), or Mode D (In-Browser Interactive Simulation) without leaving the student blocked.
