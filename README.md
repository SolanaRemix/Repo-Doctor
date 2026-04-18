# 🧠 repo‑brain  
### Autonomous Multi‑Repo Governance Engine for Modern Engineering Fleets

Repo‑brain is a protocol‑grade autonomous governance system that continuously scans, repairs, secures, and orchestrates entire fleets of repositories.  
It acts as a **hospital**, **doctor**, **surgeon**, **security firewall**, **oracle**, and **fleet orchestrator** for your codebases — ensuring every repo stays healthy, consistent, and green.

Whether you manage **1 repo or 500**, repo‑brain enforces invariants, fixes broken CI, normalizes configs, generates AI remediation PRs, predicts failures, and keeps your engineering ecosystem aligned.

---

# 🚀 Why Repo‑Brain Exists

Modern engineering teams drown in:

- broken CI  
- inconsistent configs  
- dependency drift  
- framework mismatches  
- security issues  
- multi‑repo chaos  
- missing governance  
- slow PR reviews  
- unpredictable failures  

Repo‑brain solves this by acting as an **autonomous operator** that:

- scans every repo  
- diagnoses issues  
- applies deterministic repairs  
- enforces CI + governance  
- generates AI remediation PRs  
- predicts future failures  
- syncs policies across fleets  

It’s the **brain** your repos have always needed.

---

# 🏥 The Hospital Pipeline (15‑Phase Autonomous Engine)

Repo‑brain’s core is the **Hospital Pipeline**, a deterministic multi‑stage system that transforms any repo into a healthy, invariant‑locked state.

```mermaid
flowchart TD
    classDef repo fill:#161b22,stroke:#8b949e,stroke-width:1px,color:#c9d1d9;
    classDef brain fill:#0d1117,stroke:#58a6ff,stroke-width:1px,color:#c9d1d9;
    classDef ai fill:#1a1f2b,stroke:#f39c12,stroke-width:1px,color:#f1c40f;
    classDef pr fill:#0d1117,stroke:#2ea043,stroke-width:2px,color:#c9d1d9;
    classDef forecast fill:#1f2a3d,stroke:#f39c12,stroke-width:2px,color:#f1c40f;

    A[📦 Repo Code + Config]:::repo

    H1[🏥 hospital]:::brain
    H2[🔍 detect]:::brain
    H3[🧪 scan-actions]:::brain
    H4[🧩 frameworks]:::brain
    H5[🧩 frameworks.ci]:::brain
    H6[🧪 solidity.detect]:::brain
    H7[🧪 solidity.ci]:::brain
    H8[🧪 rust]:::brain
    H9[🧱 normalize]:::brain
    H10[🧰 greenlock]:::brain
    H11[🩺 doctor]:::brain
    H12[🔧 surgeon]:::brain
    H13[🧪 verify]:::brain
    H14[🛡️ ai-guard]:::brain
    H15[🔥 firewall]:::brain
    H16[📊 vitals]:::brain
    H17[🚀 fleet]:::brain

    AI1[🤖 AI Remediation PR Generator]:::ai
    AI2[📝 PR Visual Diff + Explanation]:::pr

    F1[🔮 Next Failure Prediction]:::forecast
    F2[📈 CI Failure Heatmap]:::forecast
    F3[🌐 Public Repo Health Page]:::forecast

    A --> H1 --> H2 --> H3 --> H4 --> H5 --> H6 --> H7 --> H8 --> H9 --> H10 --> H11 --> H12 --> H13 --> H14 --> H15 --> H16 --> H17

    H12 --> AI1
    H13 --> AI1
    AI1 --> AI2

    H13 --> F1
    AI1 --> F1
    F1 --> F2
    F2 --> F3
    AI2 --> F3
    H16 --> F3

    F1 --> H1

**Autonomous Repository Governance • CyberAI Oracle Network Protocol**
Modules & Responsibilities
Repo‑brain is composed of specialized modules, each responsible for a phase of governance, repair, or security.

Module	Purpose
🏥 hospital	Full repo health scan + 15‑phase pipeline
🩺 doctor	Diagnose structural, config, and workflow issues
🔧 surgeon	Deterministic repairs to restore green builds
⚰️ autopsy	Post‑mortem analysis after failures
🧬 genome	Version diffing + mutation mapping
🛡️ immunizer	Lock invariants + prevent unsafe mutations
📊 vitals	Real‑time health metrics
🎥 blackbox	Execution trace + operator replay
🔥 firewall	Block unsafe patterns + enforce governance
🚀 fleet	Multi‑repo sync + governance
🧿 ai‑guard	LLM‑powered security scanning
🧱 normalize	Normalize repo structure + configs
🧪 verify	Build/test verification
🧩 frameworks	Framework detection + CI strategy
🧩 frameworks.ci	Multi‑framework CI generation
🧪 solidity.detect	Solidity detection
🧪 solidity.ci	Solidity CI generation
🧪 rust	Rust toolchain + CI
🧰 greenlock	Governance lock
🧰 fix.safe	Safe auto‑repair
🧠 Framework Detection, Scanning & Repair Matrix
Repo‑brain supports a wide range of modern frameworks across frontend, backend, blockchain, CI, and configuration layers.

Web / UI Frameworks
Next.js

Vite

React

Remix

Astro

SvelteKit

Nuxt

Vue

Backend / API
Node.js  (Express/Fastify)

Python FastAPI / Flask

Go Fiber / Echo

Rust Axum / Actix

Java Spring Boot

Blockchain
Solidity (Hardhat / Foundry)

Solana (Rust / Anchor)

Static / Docs
Astro

VitePress

Docusaurus

MDX pipelines

CI / DevOps
GitHub Actions

Vercel

Docker

PNPM / NPM / Yarn

ESLint / Prettier

TS project references

Config
YAML

JSON

TOML

ENV

TSConfig

📂 Supported File Types
Repo‑brain audits and repairs:

.ts .tsx .js .jsx .css .scss .html .next

.json .yaml .yml .toml

.sol .rs .go .py .java

.md .mdx

.sh .ps1

.env .env.local

---

# 🖥️ Dashboard Screenshots

The dashboard ships with **4 tabs** — a public landing page, a full admin control panel, a developer console, and a simplified fleet view — all styled with Neo Glow flash effects.

---

### 🛡️ Admin Tab — Mission Control & Fleet Overview
> Real-time oracle feed, fleet status filters (Critical / Drift / Nominal), fleet integrity distribution, and the repo registry search panel.

![Admin – Mission Control](https://github.com/user-attachments/assets/7bddfd7d-b761-4614-9a13-b35f56a277f2)

---

### 🛡️ Admin Tab — Repo Cards · 18-Phase Pipeline Grid
> Each repo card shows its health index, framework, status badge, and the full 18-phase MERMEDA pipeline with per-phase pass/fail indicators. Run Logs, YAML, Oracle, and Vercel quick-action buttons are shown inline.

![Admin – Repo Cards](https://github.com/user-attachments/assets/3064b1ea-ded8-422e-99f4-50b1af932764)

---

### 🛡️ Admin Tab — Surgery Station & Hospital Admission Portal
> One-click access to Brain Doctor, Safety Wall, Blackbox, Stack Vitals, Autopsy, Genome Map, Integrity, Protocol, and Bot Surgeon. The Admission Portal lets you scan any repo or PR on-demand.

![Admin – Surgery Station](https://github.com/user-attachments/assets/bb53218d-62a1-4988-b620-e22ef08afbe2)

---

### 📊 Full Dashboard — Complete Scrollable View
> The complete scrollable Hospital v2.2 command center showing Mission Control, fleet repo grid, Surgery Station, and the Scan Admission Portal — all in one view with Neo Glow effects.

![Full Dashboard](https://github.com/user-attachments/assets/edf1ff51-0b47-493e-8d66-79449e01cec6)

