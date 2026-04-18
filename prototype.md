# SEVAK — Prototype Explanation

## What the Prototype Demonstrates

The SEVAK prototype is a fully functional, end-to-end civic resolution loop. It is designed to show — without any network dependency — how a complaint travels from a citizen's phone all the way to a field officer's task queue and back, with AI processing and real-time updates at every step.

The prototype runs on a **Global Demo Store** (localStorage synchronization), meaning all three portals stay in sync across browser tabs even with no internet connection. This is not a mock — the AI categorization, priority scoring, and status machine are all live.

---

## The Demo Scenario: "The Pothole on Navsahyadri Road"

### Setup
Open three browser tabs:
1. `Tab 1` — Citizen Portal (`/citizen`)
2. `Tab 2` — Authority Dashboard (`/civic-dashboard`)
3. `Tab 3` — Officer Portal (`/officer`)

---

### Phase 1 — Citizen Reports the Issue

**What to do:**
- In Tab 1, click the **GPS** button. Location locks to Navsahyadri College, Naigaon (19.9975° N, 73.7898° E — hardcoded for demo reliability).
- Type: `"Large pothole near the college gate causing accidents"`
- Attach a photo (any image works in demo mode).
- Click **Submit**.

**What happens under the hood:**
1. A unique ID is generated: `CIV-2024-XXXXX`
2. The complaint is written to the Global Demo Store (localStorage)
3. Simultaneously, a `POST /api/complaints` call is made to the AI Service
4. The AI Service sends the text + image to Google Gemini 1.5 Flash
5. Gemini returns: `category: Pothole`, `department: roads_dept`, `severity: 8`, `priority_score: 62`
6. The geo-spatial clustering check runs — no existing pothole within 50 m → new master complaint created
7. SLA is set to 24 hours from now
8. The complaint is written to Supabase with status `ai_processed`
9. A "folding paper" animation plays in the Citizen Portal confirming submission

**What the citizen sees:**
A complaint receipt with the ID, category, estimated resolution time, and a link to the tracking timeline.

---

### Phase 2 — Admin Sees It Instantly

**What to do:**
- Switch to Tab 2 (Authority Dashboard).
- The new pothole complaint appears at the top of the complaint list, flagged **Critical**.

**What happens under the hood:**
1. The dashboard merges live Supabase data with Global Demo Store entries
2. Priority score `62` pushes this complaint to the top of the sorted list
3. SLA timer is already counting down — 24h window visible
4. AI-assigned category and department are pre-filled, awaiting admin confirmation

**What the admin does:**
- Opens the complaint detail modal — sees description, photo, GPS pin on map, AI categorization, and priority breakdown
- Clicks **Confirm & Dispatch**
- Selects **Officer Ravi Kumar** from the dropdown (auto-suggested based on lowest workload in Roads dept)
- Clicks **Assign**

**What happens:**
- Status transitions: `ai_processed → assigned`
- A `ASSIGNED` event is written to `complaint_events`
- Officer Ravi's `active_tasks` counter increments
- Tab 3 (Officer Portal) receives the update

---

### Phase 3 — Officer Resolves On-Site

**What to do:**
- Switch to Tab 3 (Officer Portal — logged in as Officer Ravi).
- The pothole task appears at the top of the queue.

**What the officer does:**
1. Taps **Start Work** → status becomes `in_progress`
2. Arrives at the location (demo: GPS verification passes automatically)
3. Takes a "before" photo and uploads it
4. Fills the pothole (in reality)
5. Takes an "after" photo and uploads it
6. Clicks **Confirm Resolution**

**What happens:**
- Status transitions: `in_progress → resolved`
- Before/after photos are stored in Supabase Storage
- `RESOLVED` event is logged with officer ID, timestamp, and photo URLs
- The authority dashboard reflects the resolution instantly
- A WhatsApp notification is sent to the complaint contact (if number provided) via Twilio

---

### Phase 4 — Citizen Verifies (Optional)

**What to do:**
- Return to Tab 1 (Citizen Portal).
- Enter the complaint ID in the tracking field.

**What the citizen sees:**
A timeline showing every stage: Filed → AI Processed → Assigned → In Progress → Resolved, with timestamps and officer details.

**If the issue is NOT actually fixed:**
- The citizen clicks **Not Fixed**
- Status transitions: `resolved → disputed`
- A `DISPUTED` event is logged
- The complaint re-appears in the admin dashboard flagged as **Escalated**
- SLA clock resets with a shorter window

---

## Key Design Choices

### Black-and-Cream Aesthetic
Government portals are typically sterile — flat blues, harsh whites, and generic sans-serif fonts. SEVAK uses a warm cream background with deep black text and glassmorphism card panels. The goal is to feel premium and trustworthy without feeling corporate or cold. Citizens should feel their report is being taken seriously.

### Grain Texture and Organic Shapes
A subtle CSS grain texture is applied to all panels. Combined with soft border radii and drop shadows, this gives the UI a tactile, physical quality — like a well-printed government notice, not a generic web form.

### Zero-Network Fallback
The localStorage sync is not a hack — it is a deliberate architectural choice for the prototype stage. It means the demo works on any laptop, in any venue, with any network quality (including none). The demo will never fail because the backend is down.

### The "Folding Paper" Submit Animation
When a citizen submits a complaint, the form animates as if folding into a paper slip and flying offscreen. This provides clear, satisfying feedback that the report was received — reducing the common civic UX problem of "did my report actually go through?"

### Priority Score Transparency
The admin dashboard shows the exact breakdown of each complaint's priority score (severity points + community points + days pending + category factor). This is intentional — admins need to trust the AI's prioritization, and transparency builds that trust.

### Community Clustering ("Me Too")
Citizens can see other complaints near them and add their weight to existing reports instead of duplicating them. This reflects how civic problems actually work — a pothole is a shared problem, not 40 individual problems. Clustering reduces admin noise and accurately surfaces high-impact issues.

---

## What is Hardcoded for Demo Purposes

| Feature | Demo Behavior | Production Behavior |
|---|---|---|
| GPS location | Locked to Navsahyadri College | Live device GPS |
| Officer login | Pre-seeded "Officer Ravi Kumar" | Real Supabase auth |
| AI categorization | Live Gemini API call | Same |
| Nearby complaints | Seeded demo data in Supabase | Real geo-spatial query |
| WhatsApp notification | Logged to dashboard (Twilio sandbox) | Full Twilio production |
| SLA timer | Counts from submission time | Same |
| Photo storage | Supabase Storage (real) | Same |

---

## Prototype Scope

The prototype demonstrates:
- Complete citizen → admin → officer → citizen resolution loop
- Live AI categorization and priority scoring
- Real-time cross-portal synchronization
- Before/after photo verification workflow
- Complaint tracking timeline
- Dispute and re-escalation flow
- Embeddable chat widget (separate tab/page)
- Voice complaint submission (requires LiveKit setup)

The prototype does **not** demonstrate (planned for production):
- Full multi-city tenant switching UI
- Push notification to citizen's phone
- Advanced analytics and reporting exports
- Bulk complaint assignment
- Officer routing and navigation integration
