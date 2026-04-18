# SEVAK — Pitch Overview
### The Solver Squad

---

## THE HOOK
"Raise your hand if you've reported a civic issue. Keep it up if you got a response. Keep it up if it was actually fixed."

*That silence is the problem.*

---

## THE PROBLEM

India processes 7 crore civic complaints a year. Average resolution: **34 days**. Most never get one.

Not because people don't report — but because the system is:
- **Fragmented** — every department has its own inbox, no unified view
- **Manual** — complaints routed by hand, miscategorized, lost
- **Opaque** — citizen hears nothing after filing
- **Gameable** — officers mark issues resolved with zero proof

The PS said: *"focus on workflow, use mock data."*
We didn't use mock data. We built the real thing.

---

## OUR SOLUTION — SEVAK

Three components, one platform:

| Component | Repo | What it does |
|---|---|---|
| **SEVAK Platform** | adwikataware/sevak | Web app: Citizen portal, Admin dashboard, Officer portal |
| **Agnostic Chatbot** | Aditya-Patil27/agnostic-chatbot_ap | Embeddable AI widget for any govt portal |
| **WhatsApp Agent** | atharvbhavsar/whastapp_bot | File & track complaints via WhatsApp — no app needed |

---

## OUR USPs

**1. AI processes every complaint before any human does**
Photo, video, voice (10 Indian languages), or text — Groq llama-3.2-90b extracts category, department, severity, and zone in under 10 seconds. Zero manual routing.

**2. Spatial duplicate elimination**
pgvector + Haversine GPS clustering merges nearby reports of the same issue into one master ticket. 50 people reporting the same pothole = 1 high-priority ticket, not 50 ignored ones.

**3. Priority score — pure data, zero bias**
`Severity (40) + Community reports (30) + Days pending (20) + Category urgency (10)`
What gets fixed first is decided by the formula, not by who shouted loudest.

**4. AI fraud detection on resolutions**
Officers must upload a GPS-locked after-photo to close a ticket. AI compares before vs after. Sub-standard repairs are rejected. Fake closures eliminated.

**5. Unstoppable auto-escalation**
Complaint breaches SLA → auto-escalates to Commissioner → Day 7 overdue → goes on a **public** "Long Pending" board. No human can stop this chain.

**6. Three access points**
Web portal + embeddable widget (one `<script>` tag) + WhatsApp. Every citizen, regardless of tech literacy, has a channel.

---

## DEMO

*→ Citizen files complaint on web (photo + GPS)*
*→ Admin dashboard: AI-categorized, priority-scored, ready to assign*
*→ Officer portal: task assigned, before/after photo, resolved*
*→ Citizen tracking timeline: every stage, real time*
*→ WhatsApp: photo + message → complaint ID returned instantly*
*→ Chat widget: embedded on a page, full filing + tracking in chat*

---

## PS vs WHAT WE BUILT

| PS Required | We Built |
|---|---|
| Complaint submission | Photo, video, voice, text, WhatsApp, voice call |
| Status tracking | Real-time timeline, notifications at every stage |
| Authority dashboard | Live priority queue, map view, SLA tracking, auto-escalation |
| Analytics | Department scores, SLA compliance, recurring issue detection |
| Mock data | Live Supabase DB, 7 SQL migrations, RLS policies |

---

## CLOSING LINE

*"SEVAK means servant — someone who shows up, does the work, and doesn't ask for credit. That's exactly what this system does."*
