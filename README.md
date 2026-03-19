# GoalForge - AI-Powered Life Goal Tracker

An offline-first, AI-powered personal productivity and life goal tracking application. Built with React + Vite for the web, Electron for macOS/desktop, and integrated with **Qwen 2.5** (via Ollama) for intelligent check-ins, suggestions, and daily planning - all running locally on your machine with 8GB RAM.

## Features

### Scrollable Year Timeline
- Visual "health bar" calendar showing your daily task completion across the entire year
- Color-coded days: green (80%+ tasks done), yellow (50%+), orange (some), gray (no data)
- Switch between **1 year**, **3 year**, **5 year**, and **10 year** views
- Auto-scrolls to today's date
- Hover to see completion stats for any day

### Goal Management
- Pre-loaded with life goals organized into 4 categories:
  - **Tech & Hardware**: AI Lab, Robotics, Electronics, Mechatronics, PCB Design
  - **Sciences & Math**: Chemistry, Biology, Physics, Calculus, Linear Algebra
  - **Islam & Spirituality**: 5 daily prayers, Quran, Hadith, Arabic, Dhikr
  - **Growth & Character**: Mind/Body/Soul, Family, Fitness, Reading, Journaling
- Add custom goals with milestones
- Track progress with expandable milestone checklists
- Visual progress bars per goal and per category

### Daily Task System
- Pre-loaded daily tasks (prayers, workouts, study sessions, lab work, reading)
- Add custom one-time or recurring tasks
- Priority levels (High/Medium/Low)
- Filter by category
- Daily reset for recurring tasks
- Streak tracking for consecutive productive days

### AI Assistant (Offline - Qwen 2.5)
- Runs **100% offline** using Ollama with Qwen 2.5 (7B parameters, fits in 8GB RAM)
- Quick actions: **Daily Plan**, **Check-in**, **Ideas**
- Full conversational AI that understands your goals and progress
- Context-aware suggestions based on your actual task completion and goal progress
- Respectful of Islamic values and practices

### Stats Dashboard
- Active goals count
- Average progress across all goals
- Daily task completion rate
- Consecutive day streak

## Quick Start (Web Browser)

```bash
# Clone the repo
git clone https://github.com/msp40445-bot/goal.git
cd goal

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

## Desktop App (macOS / Windows / Linux)

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.com/) (for AI features)

### Build Desktop App

```bash
# Build and package
npm run electron:build
```

The packaged app will be in the `release/` directory.

### Run in Development (Electron)

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron
npm run electron:dev
```

## AI Setup (Ollama + Qwen 2.5)

The AI assistant runs fully offline on your machine. You need **8GB RAM** minimum.

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Or download from https://ollama.com/download
```

### 2. Pull and Run the Model

```bash
# Pull Qwen 2.5 7B (4.4GB download, runs on 8GB RAM)
ollama pull qwen2.5:7b

# Start Ollama (it runs as a background service)
ollama serve
```

### 3. Verify

The app automatically detects Ollama. Look for the green dot next to "AI Assistant" in the app. If it shows red/offline, make sure Ollama is running (`ollama serve`).

## Pre-Loaded Goals

The app comes pre-configured with your personal goals:

| Category | Goals |
|----------|-------|
| Tech & Hardware | AI & Robotics Lab, Electronics & Hardware Mastery |
| Sciences & Math | Chemistry, Biology, Physics, Advanced Mathematics |
| Islam & Spirituality | Prayer consistency, Quran, Hadith, Arabic, Dhikr |
| Growth & Character | Mind/Body/Soul, Family & Character development |

### Daily Recurring Tasks
- 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Quran recitation (30 min)
- Morning workout (45 min)
- Study session - Math/Physics (1 hr)
- Electronics/Robotics lab work (2 hrs)
- Reading & reflection (30 min)
- Evening dhikr & dua
- Journal & plan tomorrow

## Tech Stack

- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Desktop**: Electron
- **AI**: Ollama + Qwen 2.5 (7B)
- **Storage**: LocalStorage (browser) / Electron Store (desktop)
- **Date Handling**: date-fns

## Project Structure

```
goal/
├── electron/
│   └── main.cjs          # Electron main process
├── public/
│   └── favicon.svg        # App icon
├── src/
│   ├── components/
│   │   ├── AIChat.jsx     # AI assistant chat interface
│   │   ├── AddGoalModal.jsx # New goal creation modal
│   │   ├── GoalCard.jsx   # Goal display with milestones
│   │   ├── StatsBar.jsx   # Dashboard statistics
│   │   ├── TaskList.jsx   # Daily task management
│   │   └── Timeline.jsx   # Scrollable year timeline
│   ├── data/
│   │   └── defaultGoals.js # Pre-loaded goals & tasks
│   ├── hooks/
│   │   └── useLocalStorage.js # Persistent state hook
│   ├── services/
│   │   └── ai.js          # Ollama/Qwen API service
│   ├── App.jsx            # Main app component
│   ├── index.css          # Global styles + Tailwind
│   └── main.jsx           # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Philosophy

> "Becoming 10% better every day."

This app is built around the idea of consistent, compound improvement. Small daily actions across your spiritual, intellectual, physical, and professional life compound into extraordinary results over time. The AI assistant helps you stay accountable, suggests what to focus on, and celebrates your progress.

## License

MIT
