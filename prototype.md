# SEVAK Prototype Explanation

The SEVAK prototype is designed to demonstrate a complete, zero-fail civic resolution loop. 

## Demo Scenario: "The Pothole Resolution"

### Phase 1: Citizen Reporting
- The user opens the Citizen Portal at Navsahyadri College.
- Clicking the **GPS** button force-locks the location to the college (Naigaon).
- The user enters "Large potholes near the gate" and attaches a photo.
- Clicking **Submit** triggers a "folding" animation and broadcasts the data to the Demo Store.

### Phase 2: Administrative Oversight
- The Authority opens the Dashboard.
- The new pothole report appears instantly at the top with a **Critical** priority (automatically assigned by the AI logic).
- The Authority clicks **Confirm & Dispatch** and selects **Officer Ravi**.

### Phase 3: Field Execution
- Officer Ravi opens his portal.
- He sees the "Pothole" task at the top of his list.
- He marks it **In Progress**, uploads a verification photo, and clicks **Confirm Resolution**.

## Key Design Choices
- **Black-and-Cream Aesthetic**: Chosen to give a premium, official, yet modern feel compared to traditional government portals.
- **Glassmorphism & Grain**: Used to create a tactile, organic UI that feels trustworthy and high-quality.
- **Zero-Network Fallback**: The prototype uses `localStorage` synchronization to ensure that even if the backend API is unreachable, the demo remains 100% functional across tabs.
