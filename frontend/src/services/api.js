import { supabase, isSupabaseConfigured } from './supabase.js';

// Persistent Local Database Keys (strictly scoped per user ID)
const STORAGE_KEYS = {
  USERS: 'smartmed_db_users',
  SESSION: 'smartmed_auth_session',
  MEDICINES_PREFIX: 'smartmed_db_medicines_usr_',
  LOGS_PREFIX: 'smartmed_db_logs_usr_',
  SETTINGS_PREFIX: 'smartmed_db_settings_usr_'
};

function readStorage(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return fallback;
  }
}

function writeStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error writing ${key}:`, e);
  }
}

// Event subscribers
const authListeners = new Set();
const hardwareListeners = new Set();

export const api = {
  // =========================================================================
  // 1. Authentication System
  // =========================================================================

  async getCurrentSession() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return null;
        return {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0]
          },
          token: session.access_token
        };
      } catch (e) {
        console.warn('Supabase getSession failed, falling back to local session:', e);
      }
    }
    // Local session
    return readStorage(STORAGE_KEYS.SESSION, null);
  },

  async getCurrentUser() {
    const session = await this.getCurrentSession();
    return session ? session.user : null;
  },

  async signUp({ name, email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: cleanName }
        }
      });
      if (error) throw error;
      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: cleanName || data.user.email.split('@')[0]
        };
        const session = { user, token: data.session?.access_token || 'sb_token' };
        writeStorage(STORAGE_KEYS.SESSION, session);
        this.notifyAuthChange(user);
        return { user, session };
      }
    }

    // Local Database Signup
    const users = readStorage(STORAGE_KEYS.USERS, []);
    const existing = users.find((u) => u.email === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: password, // In production, hash passwords
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeStorage(STORAGE_KEYS.USERS, users);

    const session = {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token: 'session_' + Date.now()
    };

    writeStorage(STORAGE_KEYS.SESSION, session);
    this.notifyAuthChange(session.user);
    return { user: session.user, session };
  },

  async login({ email, password, rememberMe = true }) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error('Please enter both email and password.');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      if (error) throw error;
      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email.split('@')[0]
        };
        const session = { user, token: data.session?.access_token };
        writeStorage(STORAGE_KEYS.SESSION, session);
        this.notifyAuthChange(user);
        return { user, session };
      }
    }

    // Local Database Login
    const users = readStorage(STORAGE_KEYS.USERS, []);
    const found = users.find((u) => u.email === cleanEmail);

    if (!found || found.password !== password) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const session = {
      user: {
        id: found.id,
        name: found.name,
        email: found.email
      },
      token: 'session_' + Date.now()
    };

    writeStorage(STORAGE_KEYS.SESSION, session);
    this.notifyAuthChange(session.user);
    return { user: session.user, session };
  },

  async logout() {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.notifyAuthChange(null);
    return true;
  },

  onAuthStateChange(callback) {
    authListeners.add(callback);
    return () => authListeners.delete(callback);
  },

  notifyAuthChange(user) {
    authListeners.forEach((fn) => {
      try { fn(user); } catch (e) { console.error(e); }
    });
  },

  // =========================================================================
  // 2. User-Specific Medicines Database (CRUD with RLS)
  // =========================================================================

  getUserMedicinesKey(userId) {
    return `${STORAGE_KEYS.MEDICINES_PREFIX}${userId}`;
  },

  getUserLogsKey(userId) {
    return `${STORAGE_KEYS.LOGS_PREFIX}${userId}`;
  },

  async getMedicines() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fetch medicines failed, fallback to local:', e);
      }
    }

    return readStorage(this.getUserMedicinesKey(user.id), []);
  },

  async addMedicine(medicineData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required to add medicine.');

    const newMed = {
      id: 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user.id,
      name: (medicineData.name || '').trim(),
      dosage: (medicineData.dosage || '').trim(),
      dosage_unit: medicineData.dosage_unit || 'mg',
      schedule_time: medicineData.schedule_time || medicineData.time || '08:00 AM',
      frequency: medicineData.frequency || 'Once a day',
      meal_instruction: medicineData.meal_instruction || medicineData.meal || 'After Meal',
      slot: Number(medicineData.slot || 1),
      start_date: medicineData.start_date || new Date().toISOString().split('T')[0],
      end_date: medicineData.end_date || null,
      notes: (medicineData.notes || '').trim(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('medicines')
          .insert([newMed])
          .select()
          .single();
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase insert failed, fallback to local:', e);
      }
    }

    // Local DB insert (scoped to user.id)
    const list = readStorage(this.getUserMedicinesKey(user.id), []);
    list.unshift(newMed);
    writeStorage(this.getUserMedicinesKey(user.id), list);
    return newMed;
  },

  async updateMedicine(id, updates) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('medicines')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase update failed:', e);
      }
    }

    const list = readStorage(this.getUserMedicinesKey(user.id), []);
    const updated = list.map((m) => (m.id === id ? { ...m, ...updates } : m));
    writeStorage(this.getUserMedicinesKey(user.id), updated);
    return updated.find((m) => m.id === id);
  },

  async deleteMedicine(id) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('medicines')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }

    const list = readStorage(this.getUserMedicinesKey(user.id), []);
    const filtered = list.filter((m) => m.id !== id);
    writeStorage(this.getUserMedicinesKey(user.id), filtered);

    // Also clean up related logs
    const logs = readStorage(this.getUserLogsKey(user.id), []);
    const filteredLogs = logs.filter((l) => l.medicine_id !== id);
    writeStorage(this.getUserLogsKey(user.id), filteredLogs);

    return true;
  },

  // =========================================================================
  // 3. Medicine Logs & Today's Schedule (Status: taken / pending / upcoming / missed)
  // =========================================================================

  async getMedicineLogs() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('medicine_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase logs error:', e);
      }
    }

    return readStorage(this.getUserLogsKey(user.id), []);
  },

  // Calculate dynamic status for today based on real database records
  calculateStatus(scheduledTimeStr, logForToday) {
    if (logForToday && logForToday.status === 'taken') {
      return { status: 'taken', takenAt: logForToday.taken_at };
    }

    // Parse scheduled time (e.g., "08:00 AM", "10:30 PM", "14:00")
    const now = new Date();
    const scheduledDate = new Date();

    const parts = scheduledTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!parts) {
      return { status: 'upcoming', takenAt: null };
    }

    let hours = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    const meridiem = parts[3] ? parts[3].toUpperCase() : null;

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    scheduledDate.setHours(hours, minutes, 0, 0);

    const diffMinutes = (now - scheduledDate) / (1000 * 60);

    // If scheduled time is more than 5 minutes in future -> upcoming
    if (diffMinutes < -5) {
      return { status: 'upcoming', takenAt: null };
    }
    // If within 5 minutes before or up to 60 minutes after -> pending (due now / soon)
    if (diffMinutes >= -5 && diffMinutes <= 60) {
      return { status: 'pending', takenAt: null };
    }
    // If more than 60 minutes past -> missed
    return { status: 'missed', takenAt: null };
  },

  async getTodaySchedule() {
    const medicines = await this.getMedicines();
    const logs = await this.getMedicineLogs();

    const todayStr = new Date().toISOString().split('T')[0];

    return medicines.map((med) => {
      // Find today's log for this medicine
      const todayLog = logs.find(
        (l) => l.medicine_id === med.id && (l.created_at || '').startsWith(todayStr)
      );

      const { status, takenAt } = this.calculateStatus(med.schedule_time, todayLog);

      return {
        ...med,
        time: med.schedule_time,
        meal: med.meal_instruction,
        status,
        takenAt: takenAt || (todayLog?.status === 'taken' ? todayLog.taken_at : null)
      };
    });
  },

  async markMedicineTaken(medicineId, customTime = null) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = customTime || now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const medicines = await this.getMedicines();
    const med = medicines.find((m) => m.id === medicineId);

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      medicine_id: medicineId,
      user_id: user.id,
      scheduled_time: med ? med.schedule_time : 'Scheduled',
      taken_at: timeStr,
      status: 'taken',
      created_at: now.toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('medicine_logs').insert([logEntry]);
      } catch (e) {
        console.warn('Supabase log insert error:', e);
      }
    }

    // Local DB insert / update for today
    const logs = readStorage(this.getUserLogsKey(user.id), []);
    const existingIndex = logs.findIndex(
      (l) => l.medicine_id === medicineId && (l.created_at || '').startsWith(todayStr)
    );

    if (existingIndex >= 0) {
      logs[existingIndex].status = 'taken';
      logs[existingIndex].taken_at = timeStr;
    } else {
      logs.unshift(logEntry);
    }
    writeStorage(this.getUserLogsKey(user.id), logs);

    // Play subtle audio confirmation chime
    this.playGentleChime('success');

    return logEntry;
  },

  // =========================================================================
  // 4. Adherence & History (Calculated dynamically from real database logs)
  // =========================================================================

  async getAdherenceStats() {
    const logs = await this.getMedicineLogs();
    const totalDoses = logs.length;
    const takenDoses = logs.filter((l) => l.status === 'taken').length;
    const missedDoses = logs.filter((l) => l.status === 'missed').length;
    const pendingDoses = logs.filter((l) => l.status === 'pending').length;

    const percentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    return {
      percentage,
      takenDoses,
      missedDoses,
      pendingDoses,
      totalDoses
    };
  },

  async getHistory(filter = 'all') {
    const medicines = await this.getMedicines();
    const logs = await this.getMedicineLogs();

    const medMap = new Map();
    medicines.forEach((m) => medMap.set(m.id, m));

    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let filtered = logs;
    if (filter === 'today') {
      filtered = logs.filter((l) => (l.created_at || '').startsWith(todayStr));
    } else if (filter === 'week') {
      filtered = logs.filter((l) => (l.created_at || '') >= sevenDaysAgo);
    } else if (filter === 'month') {
      filtered = logs.filter((l) => (l.created_at || '') >= thirtyDaysAgo);
    }

    return filtered.map((log) => {
      const med = medMap.get(log.medicine_id);
      const dateObj = new Date(log.created_at);
      const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        id: log.id,
        date: dateFormatted,
        medicine: med ? med.name : 'Prescribed Medicine',
        dosage: med ? `${med.dosage} ${med.dosage_unit || ''}`.trim() : 'Standard dose',
        scheduled: log.scheduled_time || (med ? med.schedule_time : '—'),
        taken: log.taken_at || '—',
        status: log.status,
        slot: med?.slot || 1
      };
    });
  },

  // =========================================================================
  // 5. Hardware Integration & IoT Signal Ingestion
  // =========================================================================

  subscribeHardware(callback) {
    hardwareListeners.add(callback);
    return () => hardwareListeners.delete(callback);
  },

  async receiveHardwareEvent(payload) {
    console.log('[SmartMed Hardware Event Received]:', payload);
    const now = new Date();
    const timeStr = payload.takenAt || now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (payload.medicineId) {
      await this.markMedicineTaken(payload.medicineId, timeStr);
    }

    hardwareListeners.forEach((fn) => {
      try { fn({ ...payload, receivedAt: timeStr }); } catch (e) { console.error(e); }
    });

    return { success: true, processedAt: timeStr };
  },

  // =========================================================================
  // 6. Settings & Sound System
  // =========================================================================

  async getSettings() {
    const user = await this.getCurrentUser();
    const defaultSettings = {
      reminder5Min: true,
      reminderOnTime: true,
      soundEnabled: true,
      browserNotif: false,
      theme: 'light'
    };
    if (!user) return defaultSettings;
    return readStorage(`${STORAGE_KEYS.SETTINGS_PREFIX}${user.id}`, defaultSettings);
  },

  async updateSettings(updates) {
    const user = await this.getCurrentUser();
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    if (user) {
      writeStorage(`${STORAGE_KEYS.SETTINGS_PREFIX}${user.id}`, updated);
    }
    if (updated.theme) {
      document.documentElement.setAttribute('data-theme', updated.theme);
    }
    return updated;
  },

  playGentleChime(type = 'reminder') {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'success') {
        const notes = [659.25, 830.61, 987.77];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + i * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.5);
        });
      } else {
        const notes = [523.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
          gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + i * 0.18 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.18);
          osc.stop(ctx.currentTime + i * 0.18 + 0.65);
        });
      }
    } catch (e) {
      console.warn('Audio playback blocked or unavailable:', e);
    }
  }
};
