# SEVAK — System Architecture

## Table of Contents
1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Service Breakdown](#3-service-breakdown)
4. [Data Architecture](#4-data-architecture)
5. [AI & Intelligence Layer](#5-ai--intelligence-layer)
6. [API Design](#6-api-design)
7. [Authentication & Security](#7-authentication--security)
8. [Real-time & Sync Strategy](#8-real-time--sync-strategy)
9. [Voice & Multimodal Pipeline](#9-voice--multimodal-pipeline)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Key Architectural Decisions](#11-key-architectural-decisions)

---

## 1. System Overview

SEVAK is a multi-tenant, multi-portal civic governance platform. It connects three distinct user roles — **Citizens**, **Administrative Officers**, and **Field Officers** — through a centralized AI-driven workflow. The system handles the full lifecycle of a civic complaint: from multi-modal submission, through AI categorization and priority scoring, to task assignment, on-site resolution, and citizen verification.

### Core Design Principles
- **Role-segregated micro-frontends** — each user type gets a purpose-built interface
- **AI-first processing** — every complaint passes through an intelligence layer before reaching a human
- **Zero-network resilience** — the demo prototype operates fully offline via localStorage sync
- **Multi-tenant isolation** — per-city data isolation via Supabase RLS policies
- **Multi-LLM agnosticism** — the AI backend is provider-agnostic (Gemini, OpenAI, Groq, Ollama)

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  Citizen Portal  │  │Authority Dashboard│  │  Officer Portal   │  │
│  │  (Next.js 14)    │  │  (Next.js 14)    │  │  (Next.js 14)     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └─────────┬─────────┘  │
│           │                     │                       │            │
│           └─────────────────────┼───────────────────────┘            │
│                                 │                                    │
│               ┌─────────────────▼──────────────────┐                │
│               │    Chat Widget (Vite + React)        │               │
│               │    Floating iframe / embed           │               │
│               └─────────────────────────────────────┘               │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS / REST / Streaming SSE
┌─────────────────────────▼───────────────────────────────────────────┐
│                        API GATEWAY LAYER                            │
│                                                                     │
│              ┌──────────────────────────────────┐                  │
│              │   AI Service  (Express + TypeScript)│                │
│              │   Port 3001                        │                │
│              │                                    │                │
│              │  /api/complaints   /api/chat        │                │
│              │  /api/voice        /api/user        │                │
│              │  /api/rag          /api/analytics   │                │
│              └───────┬──────────────────┬──────────┘                │
└──────────────────────┼──────────────────┼──────────────────────────┘
                       │                  │
         ┌─────────────▼──────┐  ┌────────▼────────────────────────┐
         │   LLM PROVIDERS    │  │        DATA LAYER               │
         │                    │  │                                 │
         │  Google Gemini      │  │  Supabase (PostgreSQL)          │
         │  OpenAI GPT-4o      │  │  ├── complaints_master          │
         │  Groq Llama 3.3     │  │  ├── complaint_reports          │
         │  Mistral AI         │  │  ├── complaint_events           │
         │  Ollama (local)     │  │  ├── officers                   │
         └────────────────────┘  │  ├── departments                 │
                                 │  ├── rag_documents (vector)      │
         ┌──────────────────┐    │  └── tenants                    │
         │  EXTERNAL SERVICES│   └─────────────────────────────────┘
         │                   │
         │  Twilio WhatsApp  │
         │  Deepgram STT     │
         │  Cartesia TTS     │
         │  LiveKit WebRTC   │
         │  Exa / Firecrawl  │
         └──────────────────┘
```

---

## 3. Service Breakdown

### 3.1 Admin Dashboard — Next.js 14 App

The primary frontend application. Serves all three portals from a single Next.js app using route-based role separation.

**Routes:**
```
/                      → Landing page (role selector)
/citizen               → Citizen complaint portal
/civic-dashboard       → Admin command center
/civic-dashboard/logs  → Full complaint logs
/officer               → Officer task portal
/command-center        → Extended officer command center
/login                 → Auth page (admin/officer only)
```

**Key internal modules:**

| Module | Path | Responsibility |
|---|---|---|
| Complaint Actions | `src/app/actions/` | Server actions for CRUD operations |
| Civic API Client | `src/lib/civic-api.ts` | HTTP client wrapping AI Service endpoints |
| Status Machine | `src/lib/status-machine.ts` | Complaint lifecycle state transitions |
| Supabase Clients | `src/lib/supabase/` | Browser + server + admin DB clients |
| OCR Processing | `src/lib/ollama-ocr.ts` | Local OCR for image/document analysis |
| Video Analysis | `src/lib/video-analysis.ts` | Frame extraction and CV analysis |
| City Config | `src/lib/cities.ts` | Multi-tenant city configuration |

**Component hierarchy:**
```
LandingPage
├── CitizenPortal
│   ├── ComplaintPaper (submission form)
│   ├── BulletinBoard (live updates feed)
│   └── Chatbot (embedded widget)
├── AdminDashboard
│   ├── ComplaintDetailModal
│   ├── EscalationsTable
│   └── StatusBadge
└── OfficerApp
    └── TrackingTimeline
```

---

### 3.2 AI Service — Express.js Backend

The central intelligence and API gateway. All complaint processing and LLM interactions flow through this service.

**Stack:** Node.js 18+, Express.js, TypeScript, Vercel AI SDK v6

**Internal structure:**
```
src/
├── index.ts              ← Express server bootstrap, route registration
├── middleware/
│   └── cors.ts           ← CORS policy (domain whitelist)
├── routes/
│   ├── chat.ts           ← Streaming chat handler (SSE)
│   ├── complaints.ts     ← Complaint submit/query logic
│   ├── voice.ts          ← Voice agent proxy endpoint
│   ├── user.ts           ← User session identification
│   ├── rag.ts            ← RAG document query
│   └── analytics.ts      ← Metrics and trend data
├── lib/
│   ├── ai/
│   │   ├── chat.ts       ← Multi-provider chat with follow-up generation
│   │   ├── prompts.ts    ← System prompt templates per use case
│   │   └── tools.ts      ← AI tool definitions (complaint submission, etc.)
│   ├── rag/
│   │   ├── search.ts     ← Vector similarity search logic
│   │   └── supabase.ts   ← RAG table client
│   └── utils/
│       ├── logger.ts     ← Structured logging
│       ├── colleges.ts   ← Reference data (demo locations)
│       └── encryption.ts ← Field-level encryption utilities
└── types/
    └── index.ts          ← Shared TypeScript interfaces
```

---

### 3.3 Chat Widget — Vite + React

A self-contained embeddable widget that drops into any government web page via a `<script>` tag. Renders a floating action button that opens a full chat interface.

**Features:**
- Message streaming via SSE
- Email capture for complaint tracking
- CivicForm for structured complaint submission
- TrackingTimeline for status display
- Voice input (Web Speech API / LiveKit)
- Follow-up suggestion chips
- Source citations for RAG responses
- Multi-tab sync via localStorage

**State management:** Single `useWidgetState` hook managing session, messages, and UI state.

---

### 3.4 Voice Agent — Python / LiveKit

A real-time voice conversation agent for complaint submission over WebRTC.

**Stack:** Python, LiveKit Agents SDK, Deepgram (STT), Cartesia (TTS), Silero VAD

**Conversation flow:**
```
Citizen joins LiveKit room
    ↓
Agent greets and begins structured dialogue
    ↓
Collects: Issue title → Description → Location → Severity
    ↓
Confirms details with citizen
    ↓
Calls submit_complaint tool → POST /api/complaints
    ↓
Reads back complaint ID and SLA estimate
    ↓
Session ends
```

**Languages supported:** English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi

---

### 3.5 Reference Frontend — Vite + React

A lighter, standalone React app (no Next.js) used as a backup demo interface and development reference. Mirrors the main portal components (CitizenPortal, AdminDashboard, OfficerApp, BulletinBoard, Chatbot) but without SSR or server actions.

---

## 4. Data Architecture

### 4.1 Core Tables

#### `complaints_master`
The canonical record for a unique civic issue at a specific location.

```sql
complaints_master (
  id                UUID PRIMARY KEY,
  complaint_id      TEXT UNIQUE,           -- e.g. CIV-2024-00142
  tenant_id         TEXT NOT NULL,         -- multi-tenant isolation
  reporter_id       UUID,                  -- nullable (anonymous citizens)

  title             TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,         -- Pothole | Garbage | Streetlight | ...
  department_id     TEXT NOT NULL,         -- roads_dept | drainage_dept | ...
  zone_id           TEXT,                  -- Zone A | Zone B | ...

  severity          INTEGER CHECK (severity BETWEEN 1 AND 10),
  priority_score    INTEGER CHECK (priority_score BETWEEN 0 AND 100),
  report_count      INTEGER DEFAULT 1,     -- community clustering count

  latitude          DECIMAL(10,8) NOT NULL,
  longitude         DECIMAL(11,8) NOT NULL,

  status            TEXT NOT NULL,         -- filed | ai_processed | assigned |
                                           -- in_progress | resolved | verified | disputed
  assigned_to       UUID REFERENCES officers(id),

  media_url         TEXT,                  -- primary photo/video
  before_photo_url  TEXT,
  after_photo_url   TEXT,

  sla_due_at        TIMESTAMPTZ,
  sla_breach_risk   TEXT,                  -- low | medium | high | breached

  ai_metadata       JSONB,                 -- raw AI response (category, severity, reasoning)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
)
```

#### `complaint_reports`
Child records linking additional citizen reports to a master complaint (locality clustering).

```sql
complaint_reports (
  id            UUID PRIMARY KEY,
  master_id     UUID REFERENCES complaints_master(id),
  reporter_id   UUID,
  media_type    TEXT,                 -- photo | video | voice | text
  media_url     TEXT,
  transcript    TEXT,                 -- voice-to-text output
  is_clustered  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
```

#### `complaint_events`
Immutable audit log of all status transitions and notable actions.

```sql
complaint_events (
  id            UUID PRIMARY KEY,
  complaint_id  UUID REFERENCES complaints_master(id),
  event_type    TEXT NOT NULL,        -- FILED | AI_PROCESSED | ASSIGNED |
                                      -- IN_PROGRESS | RESOLVED | VERIFIED |
                                      -- DISPUTED | ESCALATED | SLA_BREACH
  actor_id      UUID,                 -- who triggered the event
  actor_role    TEXT,                 -- citizen | admin | officer | system
  metadata      JSONB,               -- event-specific payload
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
```

#### `officers`
```sql
officers (
  id              UUID PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  name            TEXT NOT NULL,
  department_id   TEXT NOT NULL,
  zone_id         TEXT,
  active_tasks    INTEGER DEFAULT 0,
  phone           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
)
```

#### `rag_documents`
Vector store for the RAG knowledge base (Supabase pgvector).

```sql
rag_documents (
  id          UUID PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  content     TEXT NOT NULL,
  embedding   VECTOR(1536),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)
```

---

### 4.2 Key Database Functions

#### `find_nearby_master_complaint(lat, lng, category, radius_m)`
Geo-spatial PostgreSQL RPC used for locality clustering. Returns the nearest master complaint of the same category within the defined radius.

```sql
CREATE OR REPLACE FUNCTION find_nearby_master_complaint(
  p_lat DECIMAL, p_lng DECIMAL,
  p_category TEXT,   p_radius_m INTEGER
)
RETURNS TABLE(id UUID, distance_m FLOAT) AS $$
  SELECT id,
    ST_Distance(
      ST_MakePoint(longitude, latitude)::geography,
      ST_MakePoint(p_lng, p_lat)::geography
    ) AS distance_m
  FROM complaints_master
  WHERE category = p_category
    AND status NOT IN ('resolved', 'verified')
    AND ST_DWithin(
      ST_MakePoint(longitude, latitude)::geography,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_m
    )
  ORDER BY distance_m
  LIMIT 1;
$$ LANGUAGE sql;
```

#### `calculate_priority_score(complaint_id)`
Recomputes the priority score after any state change (new report, day elapsed, status update).

**Scoring formula:**
```
priority_score = min(severity * 4, 40)          -- severity component  (max 40)
              + min(report_count * 3, 30)        -- community component (max 30)
              + min(days_pending * 2, 20)        -- time component      (max 20)
              + category_urgency_factor          -- urgency constant    (max 10)
```

---

### 4.3 Row-Level Security

All tables enforce RLS for multi-tenant isolation:
- Citizens can only read complaints in their zone; write only their own reports
- Officers can only see complaints assigned to their `department_id`
- Admins hold a service-role key with full access
- Cross-tenant reads are blocked at the RLS policy level

---

## 5. AI & Intelligence Layer

### 5.1 Complaint Processing Pipeline

```
Citizen submits complaint
        │
        ▼
┌───────────────────────────────┐
│  Input Normalization          │
│  - Text cleaned               │
│  - Voice → transcript (STT)   │
│  - Image → base64             │
│  - Video → keyframe extracted │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  LLM Categorization Call      │
│  Model: Gemini 1.5 Flash      │
│  (fallback: Groq Llama 3.3)   │
│                               │
│  Extracts:                    │
│  - category (enum)            │
│  - department_id              │
│  - severity (1–10)            │
│  - suggested_zone             │
│  - sla_hours                  │
│  - reasoning (debug)          │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  Locality Clustering Check    │
│  find_nearby_master_complaint │
│                               │
│  If match found:              │
│    → attach as child report   │
│    → increment report_count   │
│    → recalculate priority     │
│  Else:                        │
│    → create new master        │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  Priority Score Calculation   │
│  (formula in §4.2)            │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  SLA Assignment               │
│  Category → SLA hours matrix  │
│  sla_due_at = NOW() + hours   │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  Persist to Supabase          │
│  + Emit FILED event           │
└──────────────┬────────────────┘
               │
               ▼
        Complaint live in
        Authority Dashboard
```

### 5.2 SLA Matrix by Category

| Category | SLA Window | Priority Floor |
|---|---|---|
| Flooding | 4 hours | Critical |
| Water Leak | 8 hours | High |
| Pothole (major road) | 24 hours | High |
| Streetlight | 48 hours | Medium |
| Garbage | 24 hours | Medium |
| Pothole (minor road) | 72 hours | Low |
| Sanitation | 12 hours | High |

### 5.3 Multi-LLM Provider Strategy

The AI service selects a provider via environment flags:

```
USE_GEMINI=true  → Google Gemini 1.5 Flash (default)
USE_GROQ=true    → Groq Llama 3.3 70B (fast, low-cost)
USE_OPENAI=true  → OpenAI GPT-4o (highest accuracy)
USE_OLLAMA=true  → Ollama local model (air-gapped deployment)
```

Provider switching is handled by Vercel AI SDK — the same `generateObject` / `streamText` call works across all providers. Retry with next provider on failure.

### 5.4 RAG Pipeline

Used by the Chat Widget and chatbot to answer citizen queries from the municipal knowledge base.

```
User query
    ↓
Generate embedding (text-embedding-3-small)
    ↓
Supabase vector similarity search (cosine, top-5)
    ↓
Inject retrieved chunks into LLM context
    ↓
Stream response with source citations
    ↓
Generate 3 follow-up suggestion chips
```

---

## 6. API Design

### Base URL
`http://localhost:3001` (dev) | `https://api.sevak.city` (prod)

### Endpoints

#### Complaints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/complaints` | Submit new complaint (triggers full AI pipeline) |
| `GET` | `/api/complaints/:id` | Fetch single complaint with events |
| `GET` | `/api/complaints?zone=&dept=&status=` | Filtered complaint list |
| `PATCH` | `/api/complaints/:id/status` | Update status (admin/officer) |
| `POST` | `/api/complaints/:id/dispute` | Citizen disputes resolution |
| `POST` | `/api/complaints/:id/support` | Citizen adds "Me Too" vote |

#### Chat

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Streaming chat (SSE), returns message + suggestions + sources |

#### Voice

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/voice/token` | Generate LiveKit room token |
| `POST` | `/api/voice/complete` | Voice-collected complaint submission |

#### Analytics

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/analytics/overview` | Dashboard summary metrics |
| `GET` | `/api/analytics/trends` | Complaint trend over time |
| `GET` | `/api/analytics/sla` | SLA compliance rates |
| `GET` | `/api/analytics/knowledge-gaps` | Unresolved knowledge base queries |
| `GET` | `/api/analytics/escalations` | Escalation list |

#### RAG

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/rag/query` | Semantic search in knowledge base |
| `POST` | `/api/rag/ingest` | Add document to knowledge base |

### Request / Response Example — POST `/api/complaints`

**Request:**
```json
{
  "tenantId": "pune-municipal",
  "title": "Large pothole near college gate",
  "description": "Deep pothole causing accidents",
  "latitude": 19.9975,
  "longitude": 73.7898,
  "mediaType": "photo",
  "mediaBase64": "data:image/jpeg;base64,...",
  "reporterId": null
}
```

**Response:**
```json
{
  "complaintId": "CIV-2024-00142",
  "masterId": "uuid-...",
  "isClustered": false,
  "category": "Pothole",
  "departmentId": "roads_dept",
  "severity": 7,
  "priorityScore": 52,
  "slaHours": 24,
  "slaDueAt": "2024-04-19T10:30:00Z",
  "status": "ai_processed"
}
```

---

## 7. Authentication & Security

### Role Model

| Role | Auth Method | Access Scope |
|---|---|---|
| Citizen | None (anonymous) | Submit and track own complaints |
| Field Officer | Supabase JWT | Own department's complaints only |
| Admin | Supabase JWT (service key) | Full dashboard, assignment, analytics |
| Service-to-service | API key (env var) | AI service ↔ Next.js backend |

### Security Measures

- **RLS policies** on all Supabase tables prevent cross-tenant and cross-role data leakage
- **Zod validation** on all API inputs — schema-enforced before any DB write
- **CORS whitelist** — AI service only accepts requests from allowed origins
- **Field encryption** — sensitive user data (phone, email) encrypted at rest via `encryption.ts`
- **JWT expiry** — admin/officer sessions expire and require re-authentication
- **No PII in logs** — logger strips personal data before writing

---

## 8. Real-time & Sync Strategy

### Production (Supabase Real-time)

Supabase real-time subscriptions push database change events to connected clients via WebSocket. The Authority Dashboard subscribes to:
- `INSERT` on `complaints_master` → new complaint appears instantly
- `UPDATE` on `complaints_master` → priority score, status, SLA risk refresh
- `INSERT` on `complaint_events` → timeline updates in detail modals

### Demo Mode (Global Demo Store)

When running without a backend, all three portals synchronize via `localStorage`:

```
CitizenPortal writes → localStorage['sevak_demo_store']
                ↓
AuthorityDashboard polls / storage event listener
                ↓
OfficerPortal polls / storage event listener
```

Changes propagate within the same browser across tabs instantly via the `storage` event. This allows a perfect multi-portal demo on a single laptop with no internet.

### Widget Multi-tab Sync

The embeddable widget uses localStorage to keep the conversation session consistent if the user opens a second tab on the same site.

---

## 9. Voice & Multimodal Pipeline

### Voice Flow (LiveKit)

```
Browser / App
    ↓ WebRTC audio stream
LiveKit Cloud (TURN / STUN)
    ↓
Python Voice Agent
    ├── Silero VAD → detects speech vs silence
    ├── Deepgram STT → real-time transcript
    ├── LLM (Gemini) → dialogue management
    └── Cartesia TTS → audio response
    ↓ Submit complaint data
Express AI Service POST /api/complaints
    ↓
Supabase
```

### Image / Video Processing

| Media Type | Processing | Library |
|---|---|---|
| JPEG/PNG | Vision analysis via LLM multimodal | Gemini Vision / GPT-4o |
| PDF / DOCX | Text extraction | unpdf, Mammoth |
| Video | Keyframe extraction → send to vision | FFmpeg (@ffmpeg/ffmpeg) |
| Scanned docs | OCR | Ollama local OCR (ollama-ocr.ts) |

### Language Detection & Translation

The AI service auto-detects the input language from the complaint text or transcript. Non-English input is processed natively by Gemini (multilingual) — no intermediate translation step required.

---

## 10. Deployment Architecture

### Services & Ports

| Service | Technology | Dev Port | Deploy Target |
|---|---|---|---|
| Admin Dashboard | Next.js 14 | 3000 | Vercel / Railway |
| AI Service | Express.js | 3001 | Railway / Render |
| Chat Widget | Vite | 5173 | Vercel / CDN |
| Voice Agent | Python / LiveKit | — | Railway + LiveKit Cloud |
| Database | Supabase | — | Supabase Cloud |

### Environment Configuration

Each service reads from a `.env` file. Key variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI Providers
GOOGLE_GENERATIVE_AI_API_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=

# Provider Toggle
USE_GEMINI=true
USE_GROQ=false
USE_OPENAI=false

# AI Service URL (used by Next.js)
AI_SERVICE_URL=http://localhost:3001

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# LiveKit Voice
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
DEEPGRAM_API_KEY=
CARTESIA_API_KEY=

# Tenant
NEXT_PUBLIC_TENANT_ID=pune-municipal
```

### Build Commands

```bash
# Admin Dashboard
npm run build && npm start

# AI Service
npm run build && node dist/index.js

# Widget
npm run build   # outputs to dist/ for CDN hosting

# Voice Agent
python -m livekit.agents start
```

---

## 11. Key Architectural Decisions

### Decision 1 — Locality Clustering via Geo-spatial SQL
**Problem:** Multiple citizens report the same pothole, creating duplicate records and diluting priority.
**Decision:** Use PostgreSQL `ST_DWithin` to find any existing complaint of the same category within a defined radius. New reports become child records on the master complaint, incrementing `report_count` and boosting the priority score.
**Trade-off:** Requires PostGIS extension on Supabase. Radius constants are hardcoded per category — may need tuning for rural vs urban deployments.

### Decision 2 — Multi-LLM Provider Abstraction via Vercel AI SDK
**Problem:** Over-reliance on a single LLM provider creates outage risk and cost lock-in.
**Decision:** Wrap all LLM calls in Vercel AI SDK — a single `generateObject()` call works with Gemini, OpenAI, Groq, and Ollama. Provider selection is an env flag.
**Trade-off:** Vercel AI SDK abstracts some provider-specific features (e.g., Gemini's video understanding requires direct API calls).

### Decision 3 — Global Demo Store (localStorage)
**Problem:** Live demo needs to work end-to-end without a stable backend.
**Decision:** All three portals write to and read from a shared `localStorage` key. Real Supabase data merges with demo-store entries in the dashboard.
**Trade-off:** localStorage is tab-sandboxed on some browsers. Storage event listeners handle cross-tab sync reliably on Chrome/Firefox.

### Decision 4 — Anonymous Citizens, Authenticated Officers
**Problem:** Requiring citizens to create accounts creates friction and reduces adoption.
**Decision:** Citizens submit anonymously. Complaints are tracked via a shareable complaint ID. Officers and admins require Supabase JWT to access protected routes.
**Trade-off:** No way to link a citizen's multiple complaints to a single identity. Abuse prevention relies on rate limiting and RLS zone restrictions.

### Decision 5 — Next.js Server Actions for Data Mutations
**Problem:** Client-side API calls expose service URLs and require token management in the browser.
**Decision:** All data mutations (submit complaint, assign officer, resolve) are Next.js Server Actions — they run on the server, keep service credentials out of the client bundle, and benefit from Next.js caching.
**Trade-off:** Server Actions are tightly coupled to Next.js; if the frontend ever migrates, these must be rewritten as API routes.

### Decision 6 — Python Voice Agent (Not Node.js)
**Problem:** Real-time audio processing and VAD are significantly more mature in Python.
**Decision:** The voice agent runs as a separate Python microservice using the LiveKit Agents Python SDK with Silero VAD and Deepgram STT.
**Trade-off:** Adds a Python runtime to the deployment stack. Node.js voice libraries (e.g., @livekit/agents) are less mature.
