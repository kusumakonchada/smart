// Initial sample data for the Smart Medicine Reminder Box IoT software dashboard

export const INITIAL_USER = {
  name: "Charitha",
  email: "charitha@smartmed.iot",
  role: "Self", // Options: "Self", "Parent", "Elderly Family Member", "Caregiver"
  patientAge: 22,
  emergencyContact: "+91 98765 43210"
};

export const INITIAL_DEVICE = {
  id: "SMB-ESP32-8824",
  name: "Smart Medicine Reminder Box",
  location: "Bedside Table / Tinkering Lab Bench 3",
  status: "connected", // "connected" | "offline"
  lastSync: "09:41 PM",
  battery: 88,
  wifiSSID: "TinkeringLab_IoT",
  ipAddress: "192.168.4.15",
  compartments: [
    { id: 1, label: "Slot 1 (Morning)", medicine: "Paracetamol", status: "empty" },
    { id: 2, label: "Slot 2 (Afternoon)", medicine: "Vitamin D", status: "present" },
    { id: 3, label: "Slot 3 (Night)", medicine: "Metformin", status: "present" }
  ]
};

export const INITIAL_SETTINGS = {
  reminder5Min: true,
  reminderOnTime: true,
  soundEnabled: true,
  browserNotif: false,
  theme: "light", // "light" | "dark"
  elderlyMode: false,
  autoHardwareSync: true
};

export const INITIAL_MEDICINES = [
  {
    id: 1,
    name: "Paracetamol",
    dosage: "500 mg",
    unit: "mg",
    tablets: 1,
    time: "08:00 AM",
    time24: "08:00",
    frequency: "Once a day",
    meal: "After Breakfast",
    slot: 1,
    status: "taken",
    takenAt: "08:04 AM",
    startDate: "2026-09-20",
    endDate: "2026-10-05",
    notes: "For mild headache / fever control"
  },
  {
    id: 2,
    name: "Vitamin D",
    dosage: "1 tablet",
    unit: "tablet",
    tablets: 1,
    time: "01:00 PM",
    time24: "13:00",
    frequency: "Once a day",
    meal: "After Lunch",
    slot: 2,
    status: "pending",
    takenAt: null,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    notes: "Take with glass of water after lunch"
  },
  {
    id: 3,
    name: "Amoxicillin",
    dosage: "250 mg",
    unit: "mg",
    tablets: 1,
    time: "08:00 PM",
    time24: "20:00",
    frequency: "Twice a day",
    meal: "After Dinner",
    slot: 3,
    status: "missed",
    takenAt: null,
    startDate: "2026-09-22",
    endDate: "2026-09-29",
    notes: "Complete entire antibiotic course"
  },
  {
    id: 4,
    name: "Metformin",
    dosage: "500 mg",
    unit: "mg",
    tablets: 1,
    time: "10:00 PM",
    time24: "22:00",
    frequency: "Once a day",
    meal: "After Dinner",
    slot: 1,
    status: "upcoming",
    takenAt: null,
    startDate: "2026-08-15",
    endDate: "2026-12-31",
    notes: "Maintains balanced glucose levels"
  },
  {
    id: 5,
    name: "Omega-3",
    dosage: "1 capsule",
    unit: "capsule",
    tablets: 1,
    time: "11:00 PM",
    time24: "23:00",
    frequency: "Once a day",
    meal: "Before Bed",
    slot: 2,
    status: "upcoming",
    takenAt: null,
    startDate: "2026-09-10",
    endDate: "2026-10-10",
    notes: "Cardiovascular supplement"
  }
];

export const INITIAL_HISTORY = [
  { id: 101, date: "Sep 28", fullDate: "2026-09-28", medicine: "Paracetamol", dosage: "500 mg", scheduled: "08:00 AM", taken: "08:04 AM", status: "taken", slot: 1 },
  { id: 102, date: "Sep 28", fullDate: "2026-09-28", medicine: "Amoxicillin", dosage: "250 mg", scheduled: "08:00 PM", taken: "—", status: "missed", slot: 3 },
  { id: 103, date: "Sep 27", fullDate: "2026-09-27", medicine: "Paracetamol", dosage: "500 mg", scheduled: "08:00 AM", taken: "08:02 AM", status: "taken", slot: 1 },
  { id: 104, date: "Sep 27", fullDate: "2026-09-27", medicine: "Vitamin D", dosage: "1 tablet", scheduled: "01:00 PM", taken: "01:10 PM", status: "taken", slot: 2 },
  { id: 105, date: "Sep 27", fullDate: "2026-09-27", medicine: "Amoxicillin", dosage: "250 mg", scheduled: "08:00 PM", taken: "08:02 PM", status: "taken", slot: 3 },
  { id: 106, date: "Sep 27", fullDate: "2026-09-27", medicine: "Metformin", dosage: "500 mg", scheduled: "10:00 PM", taken: "10:05 PM", status: "taken", slot: 1 },
  { id: 107, date: "Sep 26", fullDate: "2026-09-26", medicine: "Paracetamol", dosage: "500 mg", scheduled: "08:00 AM", taken: "08:06 AM", status: "taken", slot: 1 },
  { id: 108, date: "Sep 26", fullDate: "2026-09-26", medicine: "Vitamin D", dosage: "1 tablet", scheduled: "01:00 PM", taken: "01:03 PM", status: "taken", slot: 2 },
  { id: 109, date: "Sep 26", fullDate: "2026-09-26", medicine: "Amoxicillin", dosage: "250 mg", scheduled: "08:00 PM", taken: "08:15 PM", status: "taken", slot: 3 },
  { id: 110, date: "Sep 26", fullDate: "2026-09-26", medicine: "Metformin", dosage: "500 mg", scheduled: "10:00 PM", taken: "10:01 PM", status: "taken", slot: 1 },
  { id: 111, date: "Sep 25", fullDate: "2026-09-25", medicine: "Paracetamol", dosage: "500 mg", scheduled: "08:00 AM", taken: "08:01 AM", status: "taken", slot: 1 },
  { id: 112, date: "Sep 25", fullDate: "2026-09-25", medicine: "Vitamin D", dosage: "1 tablet", scheduled: "01:00 PM", taken: "—", status: "missed", slot: 2 },
  { id: 113, date: "Sep 25", fullDate: "2026-09-25", medicine: "Amoxicillin", dosage: "250 mg", scheduled: "08:00 PM", taken: "08:05 PM", status: "taken", slot: 3 },
  { id: 114, date: "Sep 25", fullDate: "2026-09-25", medicine: "Metformin", dosage: "500 mg", scheduled: "10:00 PM", taken: "10:08 PM", status: "taken", slot: 1 },
  { id: 115, date: "Sep 24", fullDate: "2026-09-24", medicine: "Paracetamol", dosage: "500 mg", scheduled: "08:00 AM", taken: "08:05 AM", status: "taken", slot: 1 },
  { id: 116, date: "Sep 24", fullDate: "2026-09-24", medicine: "Vitamin D", dosage: "1 tablet", scheduled: "01:00 PM", taken: "01:04 PM", status: "taken", slot: 2 },
  { id: 117, date: "Sep 24", fullDate: "2026-09-24", medicine: "Amoxicillin", dosage: "250 mg", scheduled: "08:00 PM", taken: "08:02 PM", status: "taken", slot: 3 },
  { id: 118, date: "Sep 24", fullDate: "2026-09-24", medicine: "Metformin", dosage: "500 mg", scheduled: "10:00 PM", taken: "10:00 PM", status: "taken", slot: 1 },
  { id: 119, date: "Sep 23", fullDate: "2026-09-23", medicine: "Paracetamol", dosage: "500 mg", scheduled: "08:00 AM", taken: "08:03 AM", status: "taken", slot: 1 },
  { id: 120, date: "Sep 23", fullDate: "2026-09-23", medicine: "Vitamin D", dosage: "1 tablet", scheduled: "01:00 PM", taken: "01:02 PM", status: "taken", slot: 2 },
  { id: 121, date: "Sep 23", fullDate: "2026-09-23", medicine: "Amoxicillin", dosage: "250 mg", scheduled: "08:00 PM", taken: "08:07 PM", status: "taken", slot: 3 },
  { id: 122, date: "Sep 23", fullDate: "2026-09-23", medicine: "Metformin", dosage: "500 mg", scheduled: "10:00 PM", taken: "10:12 PM", status: "taken", slot: 1 },
  { id: 123, date: "Sep 22", fullDate: "2026-09-22", medicine: "Paracetamol", dosage: "500 mg", scheduled: "08:00 AM", taken: "08:01 AM", status: "taken", slot: 1 },
  { id: 124, date: "Sep 22", fullDate: "2026-09-22", medicine: "Vitamin D", dosage: "1 tablet", scheduled: "01:00 PM", taken: "01:05 PM", status: "taken", slot: 2 },
  { id: 125, date: "Sep 22", fullDate: "2026-09-22", medicine: "Metformin", dosage: "500 mg", scheduled: "10:00 PM", taken: "10:04 PM", status: "taken", slot: 1 }
];
