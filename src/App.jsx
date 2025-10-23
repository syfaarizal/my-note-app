import { useState, useEffect } from "react";
import NotesApp from "./components/NotesApp";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Apply/remove class "dark" ke <html> sesuai state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      {/* Toggle Switch */}
      <header className="p-4 border-b flex justify-between items-center dark:border-gray-700">
        <h1 className="text-xl font-bold">To-Do & Notes App</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded-lg text-sm font-medium 
                     bg-gray-200 dark:bg-gray-700 
                     hover:bg-gray-300 dark:hover:bg-gray-600 
                     transition"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      {/* Main App */}
      <main className="p-4">
        <NotesApp />
      </main>
    </div>
  );
}