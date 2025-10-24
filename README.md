# 📝 To-Do & Notes App

---

A modern, feature-rich productivity application that combines task management with note-taking in a beautiful, intuitive interface. Built with React, Tailwind CSS, and Framer Motion.

https://img.shields.io/badge/React-18.3.1-blue https://img.shields.io/badge/Tailwind-CSS-38B2AC https://img.shields.io/badge/Vite-5.4.19-646CFF

### ✨ Features

### 🎯 Task Management
- Create & Organize Tasks - Add tasks with categories (Work, Study, Personal, Food, Sport, Other)
- Smart Reminders - Set datetime reminders with browser notifications
- Drag & Drop - Reorder tasks intuitively
- Focus Mode - Hide completed tasks for better concentration
- Search & Filter - Find tasks quickly by title or category
- Progress Tracking - Visual progress bar and completion stats

### 📝 Notes System
- Rich Notes - Create notes with titles, content, colors, and stickers
- Color Coding - Multiple color themes (Yellow, Blue, Pink, Green)
- Visual Organization - Drag & drop note cards
- Quick Editing - Modal-based editor with auto-save
- Search Functionality - Find notes by title or content

### 🎨 Customization
- Theme System - 8 beautiful themes (Default, Blue, Pink, Pastel, Cream, Green, Red, Dark)
- Auto Theme - Automatic dark/light mode based on time of day
- Responsive Design - Works perfectly on desktop, tablet, and mobile

### 🔄 Data Management
- Local Storage - All data persists in your browser
- Export Data - Download your tasks and notes as JSON
- Sync Simulation - IndexedDB-based sync demonstration
- Browser Notifications - Get reminded of upcoming tasks

### 🚀 Quick Start

#### Prerequisites

- Node.js 18+
- npm or yarn

#### Installation

1. Clone the repository
```
git clone <repository-url>
cd my-notes-app
```

2. Install dependencies
```
npm install
```

3. Start development server
```
npm run dev
```

4. Open your browser
Navigate to http://localhost:5173 

#### Build for Production
```
npm run build
npm run preview
```

### 🛠 Technology Stack
- Frontend Framework: React 18
- Build Tool: Vite
- Styling: Tailwind CSS
- Animations: Framer Motion
- Drag & Drop: @hello-pangea/dnd
- Charts: Recharts
- Icons: Lucide React
- Storage: localStorage + IndexedDB

### 📁 Project Structure
```
src/
├── components/
│   └── NotesApp.jsx          # Main application component
├── App.jsx                   # Root component with dark mode
├── main.jsx                  # Application entry point
└── index.css                 # Global styles with Tailwind
```

### 🎯 Core Components

#### Task Management
- Task creation with categories and reminders
- Visual progress tracking with pie charts
- Smart filtering and search
- Drag & drop reordering

#### Notes System
- Color-coded note cards
- Sticker decorations
- Rich text editing
- Grid-based organization

#### Theme Engine
- 8 predefined color themes
- Automatic dark mode
- Persistent theme selection
- Smooth transitions

### 🔧 API & Data Structure

#### Task Object
```
{
  id: "uuid",
  title: "Task title",
  category: "Work|Study|Personal|Food|Sport|Other",
  completed: false,
  reminderAt: "ISO-date-string"
}
```

#### Note Object
```
{
  id: "uuid",
  title: "Note title",
  content: "Note content",
  color: "yellow|blue|pink|green",
  sticker: "❤️|🌸|📌|✨|📝"
}
```

### 🎨 Themes Available
- Default - Clean white interface
- Blue - Calming blue tones
- Pink - Warm pink palette
- Pastel - Soft violet colors
- Cream - Warm amber tones
- Green - Natural green scheme
- Red - Vibrant rose colors
- Dark - Dark mode for night owls

### 📱 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 🤝 Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

### 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

### 🙏 Acknowledgments
- Icons by Lucide
- Animations by Framer Motion
- Charts by Recharts
- Drag & Drop by @hello-pangea/dnd

---

**Built with ❤️ by SICODER**

_Stay productive and organized!_