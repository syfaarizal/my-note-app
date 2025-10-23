import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash,
  CheckCircle2,
  Search,
  StickyNote,
  Palette,
  Bell,
  Download,
  RefreshCw,
  Activity,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/*************************
 * MockDB (localStorage)
 *************************/
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const STORAGE_KEYS = {
  tasks: "todo_tasks_v1",
  notes: "todo_notes_v1",
  theme: "todo_theme_v1",
};
const MockDB = {
  async getTasks() {
    await delay(200);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || "[]");
  },
  async setTasks(tasks) {
    await delay(200);
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    return tasks;
  },
  async createTask(task) {
    await delay(200);
    const tasks = await this.getTasks();
    tasks.push(task);
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    return task;
  },
  async updateTask(updated) {
    await delay(200);
    let tasks = await this.getTasks();
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    return updated;
  },
  async updateTaskReminder(id, date) {
    await delay(150);
    let tasks = await this.getTasks();
    tasks = tasks.map((t) => (t.id === id ? { ...t, reminderAt: date } : t));
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    return tasks.find((t) => t.id === id);
  },
  async deleteTask(id) {
    await delay(200);
    let tasks = await this.getTasks();
    tasks = tasks.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  },
  async getNotes() {
    await delay(200);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.notes) || "[]");
  },
  async setNotes(notes) {
    await delay(200);
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    return notes;
  },
  async createNote(note) {
    await delay(200);
    const notes = await this.getNotes();
    notes.push(note);
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    return note;
  },
  async updateNote(updated) {
    await delay(200);
    let notes = await this.getNotes();
    notes = notes.map((n) => (n.id === updated.id ? updated : n));
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    return updated;
  },
  async deleteNote(id) {
    await delay(200);
    let notes = await this.getNotes();
    notes = notes.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  },
  async getTheme() {
    await delay(100);
    return localStorage.getItem(STORAGE_KEYS.theme) || "default";
  },
  async setTheme(theme) {
    await delay(100);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  },
};

/*************************
 * IndexedDB (Sync Sim)
 *************************/
const IDB_NAME = "todo_sync_db_v1";
const IDB_STORE = "kv";
const openDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
const idbSet = async (key, value) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
const idbGet = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

/*************************
 * Themes & Notes color
 *************************/
const themes = {
  default: { bg: "bg-white", text: "text-gray-900", accent: "text-blue-500", card: "bg-white", chip: "bg-gray-100" },
  blue:    { bg: "bg-blue-50", text: "text-blue-950", accent: "text-blue-500", card: "bg-blue-100", chip: "bg-blue-100" },
  pink:    { bg: "bg-pink-50", text: "text-pink-900", accent: "text-pink-500", card: "bg-pink-100", chip: "bg-pink-100" },
  pastel:  { bg: "bg-violet-50", text: "text-violet-900", accent: "text-violet-500", card: "bg-violet-100", chip: "bg-violet-100" },
  cream:   { bg: "bg-amber-50", text: "text-amber-900", accent: "text-amber-500", card: "bg-amber-100", chip: "bg-amber-100" },
  green:   { bg: "bg-green-50", text: "text-green-900", accent: "text-green-500", card: "bg-green-100", chip: "bg-green-100" },
  red:     { bg: "bg-rose-50", text: "text-rose-900", accent: "text-rose-500", card: "bg-rose-100", chip: "bg-rose-100" },
  dark:    { bg: "bg-gray-900", text: "text-gray-100", accent: "text-gray-400", card: "bg-gray-800", chip: "bg-gray-700" },
};
const SWATCHES = [
  { key: "default", cls: "bg-white border" },
  { key: "blue", cls: "bg-blue-400" },
  { key: "pink", cls: "bg-pink-400" },
  { key: "pastel", cls: "bg-violet-400" },
  { key: "cream", cls: "bg-amber-400" },
  { key: "green", cls: "bg-green-400" },
  { key: "red", cls: "bg-rose-400" },
  { key: "dark", cls: "bg-gray-900" },
];
const NOTE_COLORS = {
  yellow: { cls: "bg-yellow-100 text-yellow-900", dark: "bg-yellow-900 text-yellow-100" },
  blue: { cls: "bg-blue-100 text-blue-900", dark: "bg-blue-900 text-blue-100" },
  pink: { cls: "bg-pink-100 text-pink-900", dark: "bg-pink-900 text-pink-100" },
  green: { cls: "bg-green-100 text-green-900", dark: "bg-green-900 text-green-100" },
};

/*************************
 * Helpers
 *************************/
const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const isDue = (iso) => (iso ? Date.now() >= new Date(iso).getTime() : false);
const STICKERS = ["❤️", "🌸", "📌", "✨", "📝"];

export default function TodoNotesApp() {
  // Core states
  const [tab, setTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [theme, setTheme] = useState("default");
  const [loading, setLoading] = useState(true);

  // Task states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Work");
  const [newTaskReminder, setNewTaskReminder] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  // Notes states (title only on create)
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteColor, setNewNoteColor] = useState("yellow");
  const [newNoteSticker, setNewNoteSticker] = useState(STICKERS[0]);
  const [notesSearch, setNotesSearch] = useState("");

  // Editor modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // {id, title, content, color, sticker}

  // Notifications
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const notifiedRef = useRef(new Set());

  // Toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (msg) => {
    const id = uuid();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  };

  // Focus Mode
  const [focusMode, setFocusMode] = useState(false);

  // Auto Theme
  const [autoTheme, setAutoTheme] = useState(false);

  // Theme handler - MOVED UP to fix ReferenceError
  const handleTheme = async (t) => {
    setTheme(t);
    try {
      await MockDB.setTheme(t);
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  const currentTheme = themes[theme] || themes.default;

  useEffect(() => {
    (async () => {
      try {
        let ts = await MockDB.getTasks();
        let ns = await MockDB.getNotes();
        let th = await MockDB.getTheme();
        
        if (ts.length === 0) {
          ts = [
            { id: uuid(), title: "Belajar React", category: "Study", completed: false, reminderAt: null },
            { id: uuid(), title: "Workout 20 menit", category: "Sport", completed: false, reminderAt: null },
          ];
          await MockDB.setTasks(ts);
        }
        if (ns.length === 0) {
          ns = [
            { id: uuid(), title: "Ide proyek", content: "Tuliskan detail proyek di sini.", color: "yellow", sticker: "✨" },
          ];
          await MockDB.setNotes(ns);
        }
        setTasks(ts);
        setNotes(ns);
        setTheme(th);

        // auto theme initial
        if (autoTheme) applyAutoTheme();
      } catch (error) {
        console.error("Failed to load data:", error);
        pushToast("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reminder tick
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const iv = setInterval(() => {
      if (Notification.permission !== "granted") return;
      setNotifPermission(Notification.permission);
      tasks.forEach((t) => {
        if (t.completed || !t.reminderAt) return;
        if (isDue(t.reminderAt) && !notifiedRef.current.has(t.id)) {
          try {
            new Notification("Task Reminder", { body: `${t.title} (📌 ${t.category})` });
            notifiedRef.current.add(t.id);
          } catch {}
        }
      });
    }, 30000);
    return () => clearInterval(iv);
  }, [tasks]);

  // Auto theme watcher
  useEffect(() => {
    if (!autoTheme) return;
    const iv = setInterval(() => applyAutoTheme(), 60000);
    return () => clearInterval(iv);
  }, [autoTheme]);

  const applyAutoTheme = async () => {
    const hour = new Date().getHours();
    const t = hour >= 19 || hour < 6 ? "dark" : "default";
    setTheme(t);
    await MockDB.setTheme(t);
  };

  /*************** Tasks ***************/
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: uuid(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      completed: false,
      reminderAt: newTaskReminder ? new Date(newTaskReminder).toISOString() : null,
    };
    await MockDB.createTask(task);
    setTasks((p) => [...p, task]);
    setNewTaskTitle("");
    setNewTaskCategory("Work");
    setNewTaskReminder("");
    pushToast("Task added");
  };

  const toggleTask = async (task) => {
    const updated = { ...task, completed: !task.completed };
    await MockDB.updateTask(updated);
    setTasks((p) => p.map((t) => (t.id === task.id ? updated : t)));
  };

  const deleteTask = async (id) => {
    await MockDB.deleteTask(id);
    setTasks((p) => p.filter((t) => t.id !== id));
    pushToast("Task deleted");
  };

  const setTaskReminder = async (task) => {
    const current = task.reminderAt ? new Date(task.reminderAt) : null;
    const base = current
      ? new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : "";
    const input = window.prompt("Set reminder (YYYY-MM-DDTHH:mm), kosongkan untuk hapus:", base);
    if (input === null) return;
    const iso = input.trim() ? new Date(input).toISOString() : null;
    const updated = await MockDB.updateTaskReminder(task.id, iso);
    setTasks((p) => p.map((t) => (t.id === task.id ? updated : t)));
    if (iso) notifiedRef.current.delete(task.id);
    pushToast(iso ? "Reminder set" : "Reminder cleared");
  };

  // DnD reorder for tasks (on visible list only)
  const onDragEndTasks = async (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;
    const visible = filteredTasks.map((t) => t.id);
    const reorderedVisible = Array.from(visible);
    const [moved] = reorderedVisible.splice(source.index, 1);
    reorderedVisible.splice(destination.index, 0, moved);
    const idToTask = new Map(tasks.map((t) => [t.id, t]));
    const newTasks = [...tasks];
    const indicesInFull = tasks.map((t, i) => (visible.includes(t.id) ? i : -1)).filter((i) => i !== -1);
    indicesInFull.forEach((pos, i) => (newTasks[pos] = idToTask.get(reorderedVisible[i])));
    await MockDB.setTasks(newTasks);
    setTasks(newTasks);
  };

  /*************** Notes (Editor) ***************/
  const createNote = async () => {
    if (!newNoteTitle.trim()) return;
    const note = { id: uuid(), title: newNoteTitle.trim(), content: "", color: newNoteColor, sticker: newNoteSticker };
    await MockDB.createNote(note);
    setNotes((p) => [...p, note]);
    setNewNoteTitle("");
    pushToast("Note created");
  };

  const openEditor = (note) => {
    setEditingNote({ ...note });
    setEditorOpen(true);
  };

  // Auto-save editor (debounced)
  useEffect(() => {
    if (!editingNote) return;
    const id = setTimeout(async () => {
      await MockDB.updateNote(editingNote);
      // reflect
      setNotes((p) => p.map((n) => (n.id === editingNote.id ? editingNote : n)));
      // also save to idb for sync convenience
      try { await idbSet("notes", notes.map((n) => (n.id === editingNote.id ? editingNote : n))); } catch (e) { /* ignore */ }
    }, 800);
    return () => clearTimeout(id);
  }, [editingNote]);

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingNote(null);
  };

  const deleteNote = async (id) => {
    await MockDB.deleteNote(id);
    setNotes((p) => p.filter((n) => n.id !== id));
    pushToast("Note deleted");
  };

  const cycleNoteColor = async (note) => {
    const order = Object.keys(NOTE_COLORS);
    const idx = order.indexOf(note.color || "yellow");
    const next = order[(idx + 1) % order.length];
    const updated = { ...note, color: next };
    await MockDB.updateNote(updated);
    setNotes((p) => p.map((n) => (n.id === note.id ? updated : n)));
  };

  // DnD for notes grid
  const onDragEndNotes = async (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;
    const visible = filteredNotes.map((n) => n.id);
    const reorderedVisible = Array.from(visible);
    const [moved] = reorderedVisible.splice(source.index, 1);
    reorderedVisible.splice(destination.index, 0, moved);
    const idToNote = new Map(notes.map((n) => [n.id, n]));
    const newNotes = [...notes];
    const indicesInFull = notes.map((n, i) => (visible.includes(n.id) ? i : -1)).filter((i) => i !== -1);
    indicesInFull.forEach((pos, i) => (newNotes[pos] = idToNote.get(reorderedVisible[i])));
    await MockDB.setNotes(newNotes);
    setNotes(newNotes);
  };

  /*************** Export, Notif, Sync ***************/
  const exportData = async () => {
    const data = { tasks, notes, theme };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todo_notes_export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushToast("Exported as JSON");
  };

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return alert("Browser tidak mendukung Notification API.");
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      pushToast(`Notifications: ${perm}`);
    } catch (e) {
      console.error(e);
    }
  };

  const syncData = async () => {
    try {
      await idbSet("tasks", tasks);
      await idbSet("notes", notes);
      await idbSet("theme", theme);
      const [ts, ns, th] = await Promise.all([idbGet("tasks"), idbGet("notes"), idbGet("theme")]);
      if (ts) { await MockDB.setTasks(ts); setTasks(ts); }
      if (ns) { await MockDB.setNotes(ns); setNotes(ns); }
      if (th) { await MockDB.setTheme(th); setTheme(th); }
      pushToast("Data synced successfully");
    } catch (error) {
      pushToast("Sync failed");
      console.error("Sync error:", error);
    }
  };

  /*************** Filters ***************/
  const filteredTasks = tasks.filter(
    (t) => (!search || t.title.toLowerCase().includes(search.toLowerCase())) && (!filter || t.category === filter)
  );
  const filteredNotes = notes.filter((n) => !notesSearch || (n.title || "").toLowerCase().includes(notesSearch.toLowerCase()));

  /*************** Dashboard / Stats ***************/
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const categories = ["Work", "Study", "Personal", "Food", "Sport", "Other"].map((cat) => ({ name: cat, value: tasks.filter((t) => t.category === cat).length }));
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#4dabf7", "#c084fc"];

  /*************** UI helpers ***************/
  const noteSnippet = (s) => (s ? s.slice(0, 30) + (s.length > 30 ? "..." : "") : "(no content)");

  if (loading) {
    return (
      <div className={`${currentTheme.bg} min-h-screen ${currentTheme.text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading your tasks and notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.bg} min-h-screen ${currentTheme.text} p-6 transition-colors`}> 
      {/* Toasts */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`px-3 py-2 rounded-2xl shadow ${themes.default.card} text-sm border`}>{t.msg}</motion.div>
        ))}
      </div>

      {/* Navbar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">To-Do + Notes</h1>
          <span className="text-sm opacity-60">— SICODER</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportData} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl shadow border hover:opacity-90 focus:ring" aria-label="Export data" title="Export data (JSON)">
            <Download className={`w-4 h-4 ${currentTheme.accent}`} />
            <span className="text-sm">Export</span>
          </button>

          <button onClick={() => { setFocusMode((f) => !f); pushToast(`Focus ${!focusMode ? 'ON' : 'OFF'}`); }} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl shadow border hover:opacity-90 focus:ring`} aria-label="Toggle focus mode" title="Focus Mode">
            <Zap className={`w-4 h-4 ${focusMode ? currentTheme.accent : 'text-gray-400'}`} />
            <span className="text-sm">Focus</span>
          </button>

          <button onClick={requestNotif} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl shadow border hover:opacity-90 focus:ring" aria-label="Enable notifications" title={`Notifications: ${notifPermission}`}>
            <Bell className={`w-4 h-4 ${notifPermission === "granted" ? currentTheme.accent : "text-gray-400"}`} />
            <span className="text-sm">Notify</span>
          </button>

          <button onClick={syncData} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl shadow border hover:opacity-90 focus:ring" aria-label="Sync data" title="Sync (IndexedDB)">
            <RefreshCw className={`w-4 h-4 ${currentTheme.accent}`} />
            <span className="text-sm">Sync</span>
          </button>

          <div className="flex items-center gap-2 border rounded-2xl px-3 py-2 shadow">
            <Palette className={`w-4 h-4 ${currentTheme.accent}`} />
            <div className="flex items-center gap-1" aria-label="Theme switcher">
              {SWATCHES.map((s) => (
                <button key={s.key} onClick={() => { setAutoTheme(false); handleTheme(s.key); }} title={s.key} aria-label={`Theme ${s.key}`} className={`w-5 h-5 rounded-full ${s.cls} flex-shrink-0 border ${theme === s.key ? "ring-2 ring-offset-2" : ""}`} />
              ))}
            </div>
            <button onClick={() => { setAutoTheme((a) => !a); pushToast(`Auto Theme ${!autoTheme ? 'ON' : 'OFF'}`); }} title="Auto Theme" aria-label="Auto Theme" className="ml-2 px-2 py-1 rounded-xl border">
              {autoTheme ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Top dashboard + controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-1 p-4 rounded-2xl shadow border bg-white/60" style={{ backdropFilter: 'blur(6px)' }}>
          <h3 className="font-semibold">Dashboard</h3>
          <p className="text-sm opacity-70">Total tasks: {totalTasks}</p>
          <p className="text-sm opacity-70">Completed: {completedTasks}</p>
          <p className="text-sm opacity-70">Total notes: {notes.length}</p>
          <div className="mt-3">
            <div className="text-xs mb-1">Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-2 rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6ee7b7,#60a5fa)' }} />
            </div>
            <div className="text-xs mt-1">{progress}%</div>
          </div>
        </div>

        <div className="lg:col-span-3 p-4 rounded-2xl shadow border bg-white/60" style={{ backdropFilter: 'blur(6px)' }}>
          <h3 className="font-semibold mb-2">Category Breakdown</h3>
          <div style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} paddingAngle={2}>
                  {categories.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab("tasks")} className={`px-4 py-2 rounded-2xl shadow ${tab === "tasks" ? "bg-gray-200 font-semibold" : "bg-gray-100"}`}>Tasks</button>
        <button onClick={() => setTab("notes")} className={`px-4 py-2 rounded-2xl shadow ${tab === "notes" ? "bg-gray-200 font-semibold" : "bg-gray-100"}`}>Notes</button>
      </div>

      {tab === "tasks" && (
        <div>
          {/* Task form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
            <input aria-label="Task title" type="text" placeholder="New task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="md:col-span-5 border rounded-2xl px-3 py-2 shadow focus:ring bg-transparent" />
            <select aria-label="Category" value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="md:col-span-3 border rounded-2xl px-2 py-2 shadow focus:ring bg-transparent">
              {["Work", "Study", "Personal", "Food", "Sport", "Other"].map((c) => (<option key={c}>{c}</option>))}
            </select>
            <div className="md:col-span-3 flex items-center border rounded-2xl px-2 py-2 shadow">
              <Bell className="w-4 h-4 mr-2" />
              <input aria-label="Reminder date and time" type="datetime-local" value={newTaskReminder} onChange={(e) => setNewTaskReminder(e.target.value)} className="flex-1 outline-none bg-transparent" />
            </div>
            <button onClick={addTask} className="md:col-span-1 px-3 py-2 rounded-2xl shadow bg-blue-100 hover:opacity-90" aria-label="Add task" title="Add task"><Plus className="w-5 h-5" /></button>
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex items-center border rounded-2xl px-2 shadow flex-1">
              <Search className="w-4 h-4 mr-1" />
              <input aria-label="Search" type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none py-1 bg-transparent" />
            </div>
            <select aria-label="Filter category" value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-2xl px-2 py-2 shadow focus:ring bg-transparent">
              <option value="">All</option>
              {["Work", "Study", "Personal", "Food", "Sport", "Other"].map((c) => (<option key={c}>{c}</option>))}
            </select>
          </div>

          {/* Task list with DnD */}
          <DragDropContext onDragEnd={onDragEndTasks}>
            <Droppable droppableId="taskList">
              {(provided) => (
                <ul className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredTasks.filter(t => !focusMode || !t.completed).map((task, index) => (
                    <Draggable draggableId={task.id} index={index} key={task.id}>
                      {(prov, snapshot) => (
                        <motion.li ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex items-center justify-between border rounded-2xl px-3 py-2 shadow ${snapshot.isDragging ? "bg-gray-50" : ""}`}>
                          <div className={`flex items-center gap-2 ${task.completed ? "line-through text-gray-500" : ""}`}>
                            <button onClick={() => toggleTask(task)} aria-label="Toggle complete" title="Complete">
                              <CheckCircle2 className={`w-5 h-5 ${task.completed ? currentTheme.accent : "text-gray-400"}`} />
                            </button>
                            <span>{task.title}</span>
                            <span className="text-xs text-gray-400">[{task.category}]</span>
                            {task.reminderAt && (
                              <Bell className={`w-4 h-4 ${isDue(task.reminderAt) ? "text-red-400" : currentTheme.accent}`} title={new Date(task.reminderAt).toLocaleString()} aria-label="Has reminder" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setTaskReminder(task)} aria-label="Set reminder" title="Set reminder" className="p-1 rounded-xl hover:bg-gray-100"><Bell className="w-4 h-4" /></button>
                            <button onClick={() => deleteTask(task.id)} aria-label="Delete task" title="Delete"><Trash className="w-5 h-5 text-red-400" /></button>
                          </div>
                        </motion.li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {tab === "notes" && (
        <div>
          {/* Note form (title only) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
            <input aria-label="Note title" type="text" placeholder="Note title..." value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} className="sm:col-span-6 border rounded-2xl px-3 py-2 shadow focus:ring bg-transparent" />
            <select aria-label="Note color" value={newNoteColor} onChange={(e) => setNewNoteColor(e.target.value)} className="sm:col-span-3 border rounded-2xl px-2 py-2 shadow focus:ring bg-transparent">
              <option value="yellow">Yellow</option>
              <option value="blue">Blue</option>
              <option value="pink">Pink</option>
              <option value="green">Green</option>
            </select>
            <select aria-label="Note sticker" value={newNoteSticker} onChange={(e) => setNewNoteSticker(e.target.value)} className="sm:col-span-2 border rounded-2xl px-2 py-2 shadow focus:ring bg-transparent">
              {STICKERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={createNote} className="sm:col-span-1 px-3 py-2 rounded-2xl shadow bg-green-100" aria-label="Create note" title="Create note"><Plus className="w-5 h-5" /></button>
          </div>

          {/* Notes search */}
          <div className="flex items-center border rounded-2xl px-2 shadow mb-4">
            <Search className="w-4 h-4 mr-1" />
            <input aria-label="Search notes" type="text" placeholder="Search notes..." value={notesSearch} onChange={(e) => setNotesSearch(e.target.value)} className="flex-1 outline-none py-1 bg-transparent" />
          </div>

          {/* Notes grid with DnD */}
          <DragDropContext onDragEnd={onDragEndNotes}>
            <Droppable droppableId="noteGrid" direction="horizontal">
              {(provided) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredNotes.map((note, index) => (
                    <Draggable draggableId={note.id} index={index} key={note.id}>
                      {(prov) => (
                        <motion.div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`relative p-4 rounded-2xl shadow ${ (theme==='dark' ? (NOTE_COLORS[note.color]?.dark || NOTE_COLORS.yellow.dark) : (NOTE_COLORS[note.color]?.cls || NOTE_COLORS.yellow.cls)) }`} onClick={() => openEditor(note)} style={{ cursor: 'pointer' }}>
                          <div className="absolute top-2 left-2 text-xl">{note.sticker || '✨'}</div>
                          <h4 className="font-semibold">{note.title}</h4>
                          <p className="text-sm opacity-70 mt-2">{noteSnippet(note.content)}</p>
                          <div className="absolute top-2 right-2 flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); cycleNoteColor(note); }} aria-label="Change color" title="Change color" className="p-1 rounded-xl hover:bg-white/40"><Palette className={`w-4 h-4 ${currentTheme.accent}`} /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} aria-label="Delete note" title="Delete note"><Trash className="w-4 h-4 text-red-400" /></button>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {editorOpen && editingNote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className={`w-full max-w-3xl p-6 rounded-2xl shadow-lg border ${currentTheme.card} ${currentTheme.text}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{editingNote.sticker || '✨'}</div>
                  <input value={editingNote.title} onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })} className="text-xl font-semibold bg-transparent outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <select value={editingNote.color} onChange={(e) => setEditingNote({ ...editingNote, color: e.target.value })} className="rounded-xl px-2 py-1 border bg-transparent">
                    <option value="yellow">Yellow</option>
                    <option value="blue">Blue</option>
                    <option value="pink">Pink</option>
                    <option value="green">Green</option>
                  </select>
                  <select value={editingNote.sticker} onChange={(e) => setEditingNote({ ...editingNote, sticker: e.target.value })} className="rounded-xl px-2 py-1 border bg-transparent">
                    {STICKERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => { MockDB.updateNote(editingNote); closeEditor(); pushToast('Saved'); }} className="px-3 py-1 rounded-2xl border">Save</button>
                </div>
              </div>

              <textarea value={editingNote.content} onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })} placeholder="Write your note... (autosave)" className="w-full min-h-[240px] border rounded-xl p-3 bg-transparent outline-none" />

              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => { closeEditor(); }} className="px-3 py-1 rounded-2xl border">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-10 text-center text-sm opacity-70">
        Made with ❤️ by <span className="font-semibold">SICODER</span>
      </footer>
    </div>
  );
}