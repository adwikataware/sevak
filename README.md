<div align="center">
  <h1>🏛️ SEVAK</h1>
  <p><strong>Smart Civic Intelligence & Real-time Platform</strong></p>
  <p><i>Empowering Citizens. Automating Governance. Building Smart Cities.</i></p>
  <p>Developed with 💙 by <b>The Solver Squad</b></p>

  <br />

  [![Built With Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Powered By Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![AI By Groq](https://img.shields.io/badge/AI_Vision-Groq_llama_3.2_90B-f55036?style=for-the-badge)](https://groq.com)
  [![Realtime Event Architecture](https://img.shields.io/badge/Architecture-WebSockets_Pub/Sub-007ACC?style=for-the-badge)](https://supabase.com/realtime)
</div>

---

## 🌍 Vision

**SEVAK** is not just a complaint management system. It is a highly scalable, national-grade **Real-time Civic Intelligence Engine**. We bridge the communication gap between municipal authorities and everyday citizens using Multi-Modal AI, event-driven architecture, and multi-tenant isolation — solving real-world infrastructure issues faster than ever before.

> [!IMPORTANT]
> **The Problem:** Modern cities suffer from broken roads, scattered garbage, and massive infrastructural delays because government systems are fragmented, single-city scoped, and require heavy manual tracking.
>
> **Our Solution [SEVAK]:** A proactive AI system that automatically categorizes civic issues, blocks spam and duplicate tickets via spatial SQL, evaluates image-based resolutions for fraud, and cleanly isolates data across massive municipal bodies.

---

## 🔥 Key Features

### 1. 🗃️ Multi-Tenant National Architecture
Designed for the scale of a nation. The backend seamlessly isolates complaints, analytics, and officer routing down to the individual Municipal Corporation (e.g., Pune, Mumbai, Nagpur) — ensuring zero data leakage and full security using database-level `tenant_id` locking enforced by Supabase Row-Level Security policies.

### 2. 👁️ Groq Vision AI — Fraud Verification & Pre-Validation
Officers cannot blindly mark issues as resolved. Using **Groq's llama-3.2-90b-vision-preview**, SEVAK acts as an autonomous auditor. Whenever an "After Repair" photo is uploaded, the AI validates the structural integrity of the repair before closing the ticket. Sub-standard repairs are actively rejected.

### 3. 🗺️ Spatial RAG Engine — Duplicate Clustering
Duplicate complaints are eliminated at the database level. Using **pgvector**, SEVAK computes the cosine similarity of complaint embeddings alongside Haversine GPS distances to mathematically cluster issues (e.g., 50 people reporting the same pothole) into one high-priority master ticket — boosting its score rather than creating noise.

Cluster radii by category:
- Pothole: 50 m · Garbage: 30 m · Streetlight: 40 m · Water Leak: 100 m · Flooding: 500 m

### 4. ⚡ Event-Driven WebSockets — Supabase Realtime
The entire Administrative Command Center is wired to Supabase Realtime native Pub/Sub WebSockets. The millisecond a citizen files an issue from the street, the dispatch map and analytics dashboards update frictionlessly — no refresh, no polling.

### 5. ⚖️ SLA Governance & Auto-Escalation — Lazy Evaluation
No civic issue gets silently ignored. Using lazy-evaluation techniques inside PostgreSQL RPCs, the system autonomously sweeps the database whenever an administrator logs in, instantly escalating any complaint that has breached its Service Level Agreement window.

### 6. 🎙️ Multi-Modal Complaint Submission
Citizens can report issues through:
- **Photos** — AI vision analysis for issue detection
- **Videos** — Computer vision frame extraction
- **Voice notes** — Multilingual speech-to-text (10 languages: English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi)
- **Text** — Free-form description
- **Live Voice Agent** — Phone-like WebRTC call via LiveKit with real-time dialogue and automatic form submission

### 7. 🤖 AI Priority Engine
Every complaint is processed by Groq / Gemini before reaching any human. The engine extracts category, department, severity (1–10), and computes a priority score (0–100):

| Component | Max Points |
|---|---|
| Severity | 40 |
| Community report count | 30 |
| Days pending | 20 |
| Category urgency factor | 10 |

### 8. 📡 Embeddable Chat Widget
A floating AI chatbot widget embeds on any government portal via a `<script>` tag. Supports natural-language complaint filing, status tracking, RAG-powered knowledge base queries, and voice input — without navigating away from the host page.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend UI** | Next.js 14, React 19, Tailwind CSS 4, shadcn/ui | Admin command center & all portals |
| **Widget App** | Vite, React Web Component | Omni-channel embeddable citizen app |
| **Database** | Supabase (PostgreSQL + pgvector + RLS) | Enterprise backend with native GIS tools |
| **Intelligence** | Groq llama-3.2-90b, Gemini 1.5 Flash, OpenAI GPT-4o | AI routing, vision CV, semantic context |
| **AI SDK** | Vercel AI SDK v6 | Multi-provider streaming, tool use |
| **Realtime Sync** | Supabase WebSockets, LiveKit WebRTC | Pub/Sub event bus and voice channels |
| **Voice Agent** | Python, LiveKit Agents SDK, Deepgram STT, Cartesia TTS | Real-time voice complaint filing |
| **Messaging** | Twilio WhatsApp API | Status update notifications |

---

## 🏗️ Three Portals, One Platform

| Portal | Who uses it | What they do |
|---|---|---|
| **Citizen Portal** | Public (anonymous) | Report issues via photo, video, voice, or text |
| **Authority Dashboard** | Municipal officers / Admins | Review, prioritize, assign, and monitor complaints |
| **Officer Portal** | Field workers | Receive tasks, capture before/after photos, resolve on-site |

---

## 📁 Project Structure

```
sevak/
├── admin_dashboard/              # Next.js 14 — main frontend (all three portals)
├── frontend/                     # Vite + React — reference UI
├── agnostic-chatbot/
│   └── services/
│       ├── admin-dashboard/      # Extended Next.js app (command center + migrations)
│       │   └── supabase/         # SQL migration files (001 → 007)
│       ├── ai-service/           # Express.js AI backend
│       ├── widget/               # Embeddable React chat widget
│       └── voice-agent/          # Python LiveKit voice agent
└── widget1/                      # Alternative widget instance
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/saurabh-G07/agnostic-chatbot.git
cd agnostic-chatbot
```

### 2. Run Supabase Migrations
The database is the foundation of the entire system. In your Supabase project's SQL Editor, run the migration files from:
```
services/admin-dashboard/supabase/
```
Execute them in chronological order (`001` → `007`) to instantiate the full SEVAK schema, including RLS policies, geo-spatial functions, and vector indexes.

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in each service and fill in your API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
LIVEKIT_URL=
DEEPGRAM_API_KEY=
```

### 4. Start the AI Service
```bash
cd services/ai-service
npm install
npm run dev        # http://localhost:3001
```

### 5. Start the Command Center Dashboard
```bash
cd services/admin-dashboard
npm install
npm run dev        # http://localhost:3000
```

### 6. (Optional) Start the Chat Widget
```bash
cd services/widget
npm install
npm run dev        # http://localhost:5173
```

### 7. (Optional) Start the Voice Agent
```bash
cd services/voice-agent
pip install -r requirements.txt
python -m livekit.agents dev
```

---

## 🎨 Design System

SEVAK uses a **"Black-and-Cream"** palette to evoke a premium, trustworthy government aesthetic — distinct from the sterile blue/white of traditional portals.

- **Glassmorphism** panels with grain texture for a tactile, high-quality feel
- **Organic shapes** and soft shadows to reduce formality without losing authority
- **Social connectivity** visual motifs to reinforce community-driven reporting
- Status colors: Green (resolved), Yellow (in progress), Red (escalated/breach), Gray (pending)

---

## 🔒 Security & Isolation

- Database-level `tenant_id` locking on every table via Supabase RLS
- Citizens are anonymous — no PII required to file a complaint
- Officers and admins authenticate via Supabase JWT
- All API inputs validated with Zod schemas before any DB write
- Field-level encryption for sensitive contact data

---

<div align="center">
  <p><b>Built to Win. Built for the Citizens.</b></p>
  <p>— <b>The Solver Squad</b> 🚀</p>
</div>
