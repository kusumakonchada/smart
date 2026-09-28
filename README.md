# SmartMed — Smart Medicine Reminder Box 💊

> **Never miss a dose. Stay on schedule.**

A modern, production-grade medication monitoring and schedule tracking web application connected to the physical **Smart Medicine Reminder Box** hardware.

---

## 🌟 Key Capabilities

1. **Real Authentication & Multi-User Isolation**
   - Independent user registration (`/signup`) and secure login (`/login`).
   - Zero auto-login of demo accounts; unauthenticated sessions strictly redirect to `/login`.
   - Complete data isolation: User B can **never** see User A's medicines or dosage logs.

2. **Persistent Database & Supabase Integration**
   - PostgreSQL / Supabase ready (`@supabase/supabase-js`) with full Row Level Security (`RLS`) policies defined in `schema.sql`.
   - Automatic fallback to isolated persistent storage when running standalone.
   - Dynamic schedule calculation: status (*upcoming*, *pending*, *taken*, *missed*) derived directly from database records.

3. **Complete Medicine CRUD**
   - **Add Medicine**: Saves prescriptions directly to the database with multiple dosage times, meal timing, and compartment slot assignments.
   - **Edit Medicine**: In-place modification modal with immediate database synchronization.
   - **Delete Medicine**: Confirmation modal before permanent deletion.
   - **Mark as Taken**: Manual confirmation or hardware auto-detection that timestamps the dose and updates adherence.

4. **Working Medicine Reminder System**
   - **5-Minute Advance Reminder**: Floating orange toast & browser push notification 5 minutes before scheduled dose.
   - **Medicine Time Alarm**: Exact-time notification with gentle two-tone audio chime.
   - **Desktop Notifications**: Native browser push notifications supported.

5. **Hardware Integration & IoT Bridge**
   - `backend/server.js`: Node.js server receiving hardware events via `POST /api/hardware/event` and streaming real-time SSE updates.
   - `backend/serial.js`: Reads serial telemetry from Arduino / ESP32 USB COM port.
   - `arduino/SmartMedicineBox.ino`: Microcontroller firmware reading IR sensors, triggering reminder buzzers, and transmitting JSON packets.

---

## 📂 Project Architecture

```text
SmartMedicineBox/
├── README.md
├── schema.sql                     # Supabase PostgreSQL tables & RLS security policies
│
├── frontend/
│   ├── .env.example               # Supabase credentials template
│   ├── .env                       # Environment variables (git-ignored)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx          # Real sign-in page with route protection
│       │   ├── Signup.jsx         # New user registration
│       │   ├── Dashboard.jsx      # Live clock, countdown, summary cards, today schedule
│       │   ├── AddMedicine.jsx    # Database insert with meal instructions & slots
│       │   ├── Medicines.jsx      # Prescription list with edit & delete modals
│       │   ├── History.jsx        # Database logs table & dynamic adherence gauge
│       │   └── Settings.jsx       # Reminder timings, sound preview & themes
│       │
│       ├── components/
│       │   ├── Navbar.jsx         # User identity, logout, and navigation
│       │   ├── LiveClock.jsx      # Real-time ticking clock & formatted date
│       │   ├── ReminderCard.jsx   # Next medicine hero card with live countdown
│       │   ├── MedicineCard.jsx   # Schedule card with status and 'Mark as Taken'
│       │   ├── StatusBadge.jsx    # Accessible status indicators
│       │   └── NotificationToast.jsx # Reusable floating notification popups
│       │
│       ├── services/
│       │   ├── api.js             # Authentication, CRUD, and status algorithms
│       │   └── supabase.js        # Supabase client initialization
│       │
│       ├── App.jsx                # Protected routes & automated reminder scheduler
│       ├── main.jsx               # React entry point
│       └── index.css              # Calm healthcare design system
│
├── backend/
│   ├── server.js                  # IoT hardware bridge server & SSE broadcaster
│   └── serial.js                  # USB COM port serial listener
│
└── arduino/
    └── SmartMedicineBox.ino       # Microcontroller firmware with IR sensors & buzzer
```

---

## ⚡ Quick Start

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Configure Supabase (Optional)
To link your own Supabase cloud database:
1. Copy `frontend/.env.example` to `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
2. In your Supabase SQL Editor, run the SQL script in `schema.sql` to create the `medicines` and `medicine_logs` tables with Row Level Security.

### 3. Run Automated Multi-User Verification Tests
```bash
node test-flows.cjs
```
Verifies signup, login, multi-user isolation, CRUD operations, mark as taken, and deletion.
