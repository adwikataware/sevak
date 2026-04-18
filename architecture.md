# SEVAK Architecture

## System Overview
SEVAK utilizes a multi-portal micro-frontend approach, where each user role (Citizen, Authority, Officer) has a dedicated interface tailored to their specific needs, all synchronized via a central intelligence layer.

## Component Workflow

### 1. The Reporting Layer (Citizen Portal)
- **Input**: User describes an issue and provides a photo.
- **Geospatial**: `watchPosition` API captures high-accuracy coordinates. (Demo: Locked to Navsahyadri College).
- **Sync**: Upon submission, the record is injected into the **Global Demo Store** (LocalStorage) and optionally pushed to the AI-Service API.

### 2. The Intelligence Layer (AI-Service)
- **Model**: Google Gemini 1.5 Flash.
- **Categorization**: Analyzes text to determine department (Roads, Electrical, etc.) and priority.
- **Priority Scoring**: Assigns a numeric score (0-100) based on severity and locality impact.

### 3. The Command Layer (Authority Dashboard)
- **Aggregation**: Merges live API data with the Global Demo Store entries.
- **Dispatch**: Allows administrators to confirm AI categorization and assign specific field officers (e.g., Ravi Kumar).
- **SLA Tracking**: Monitors response times and potential breaches.

### 4. The Fulfillment Layer (Officer Portal)
- **Dispatch**: Receives real-time push-style updates for assigned tasks.
- **Resolution**: Requires "After" photo upload and geo-verification to mark an issue as "Resolved."

## Data Flow Diagram
`Citizen -> AI Categorization -> Priority Score -> Admin Dashboard -> Officer Assignment -> Resolution -> Feedback`
