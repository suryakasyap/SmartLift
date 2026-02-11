# 💪 SmartLift

A modern, dark-themed workout tracking Progressive Web App built with React and TypeScript. Track your workouts, monitor your progress, and stay motivated with streak tracking and beautiful visualizations.

![SmartLift](https://img.shields.io/badge/SmartLift-Workout%20Tracker-ff4757?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNi41IDYuNSAxMSAxMSIvPjxwYXRoIGQ9Im0yMS41IDE3LjUtNSA1LTQtNCIvPjxwYXRoIGQ9Im0yLjUgNi41IDUgNS01IDUiLz48cGF0aCBkPSJtNy41IDIuNSA0IDQgNS01Ii8+PC9zdmc+)

## ✨ Features

### 📅 Smart Workout Planning
- **Weekly Scheduling** - Plan workouts on specific days of the week
- **Spacing Mode** - Set intervals (e.g., every 2 days) for flexible training
- **Reminders** - Set workout reminders with customizable time (12h/24h format)
- **Cycling** - Cycle through workout routines automatically

### 🏋️ Exercise Management
- **Rep-based Exercises** - Track sets, reps, and weight targets
- **Time-based Exercises** - Perfect for planks, holds, and cardio with time counters
- **Muscle Group Tagging** - Organize exercises by body part
- **Equipment Selection** - Filter exercises by available equipment
- **Custom Colors** - Personalize each exercise with theme colors

### 📊 Workout Sessions
- **Live Tracking** - Real-time workout timer and set logging
- **Warm-up Sets** - Mark warm-up sets separately
- **Rest Timer** - Built-in rest timer between sets
- **Add/Delete Sets** - Dynamically manage sets during workouts

### 🔥 Progress Tracking
- **Streak Counter** - Animated streak display to keep you motivated
- **Calendar Grid** - Visual overview of completed workouts
- **Workout History** - Detailed logs with reps, weight, and session stats
- **Max Records** - Track personal bests for reps and weight

### 🎨 Customization
- **Dark Theme** - Beautiful dark UI designed for gym environments
- **Theme Colors** - 5 preset colors + custom color picker
- **Units Toggle** - Switch between Metric (kg) and Imperial (lbs)
- **Week Start** - Choose Monday or Sunday as week start

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router 7 (HashRouter) |
| **State Management** | Zustand 5 |
| **Database** | Dexie.js (IndexedDB) |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Deployment** | GitHub Pages |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BottomNav.tsx      # Navigation bar
│   ├── BottomSheet.tsx    # Modal bottom sheets
│   ├── Button.tsx         # Button component
│   ├── CalendarGrid.tsx   # Monthly calendar view
│   ├── Toggle.tsx         # Toggle switch
│   ├── Inputs.tsx         # Counter & TimeCounter components
│   └── ...
├── pages/               # Route pages
│   ├── Home.tsx           # Dashboard with today's workout
│   ├── CreateWorkout.tsx  # Workout creation/editing
│   ├── CreateExercise.tsx # Exercise creation/editing
│   ├── WorkoutSession.tsx # Active workout tracking
│   ├── History.tsx        # Workout history logs
│   ├── Settings.tsx       # App settings
│   ├── Stats.tsx          # Statistics (coming soon)
├── store/               # Zustand state stores
│   ├── workoutStore.ts    # Workout form state
│   ├── themeStore.ts      # Theme/color preferences
│   ├── userStore.ts       # User profile settings
│   ├── equipmentStore.ts  # Available equipment
│   └── devStore.ts        # Developer tools (date override)
├── db/                  # Database layer
│   └── db.ts              # Dexie IndexedDB schema
├── lib/                 # Utilities
│   ├── utils.ts           # Helper functions (cn, etc.)
│   └── scheduler.ts       # Workout scheduling logic
└── App.tsx              # Router configuration
```

---

## 🗄️ Database Schema

### Workouts
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Auto-increment primary key |
| `name` | string | Workout name |
| `planning_type` | 'week_days' | 'spacing' | 'never' | Scheduling mode |
| `week_days` | string[] | Selected days (e.g., ['Monday', 'Friday']) |
| `spacing_days` | number | Days between workouts |
| `reminder_time` | string? | HH:MM format |
| `color` | string? | Hex color code |
| `cycle_enabled` | boolean | Enable workout cycling |
| `rest_time` | number | Rest between sets (seconds) |

### Exercises
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Auto-increment primary key |
| `workoutId` | number | Foreign key to workout |
| `name` | string | Exercise name |
| `rep_type` | 'reps' | 'time' | Counting mode |
| `target_reps` | number | Target rep count |
| `target_weight` | number | Target weight |
| `target_time` | number? | Target duration (seconds) |
| `muscle_group` | string | Target muscles |
| `equipment` | string | Required equipment |

### Workout Logs
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Auto-increment primary key |
| `workoutId` | number | Foreign key to workout |
| `date` | Date | Session date |
| `durationSeconds` | number | Total session time |
| `exercises` | array | Logged sets with reps/weight |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/SmartLift.git
cd SmartLift

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:host` | Start with network access |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Deploy to GitHub Pages |

---

## 📱 Deployment

### GitHub Pages

The app is pre-configured for deployment to GitHub Pages under the `/SmartLift/` base path.

1. Create a repository on GitHub named **SmartLift**.
2. Push your local code to the repository:
   ```bash
   git remote add origin https://github.com/your-username/SmartLift.git
   git push -u origin main
   ```
3. Run the deployment command:
   ```bash
   npm run deploy
   ```
4. In your GitHub repository settings, go to **Settings → Pages** and ensure the source is set to the **gh-pages** branch.

The app uses **HashRouter** to ensure deep links work correctly on static hosting without additional server configuration.

---

## 🎯 Key Technical Decisions

### IndexedDB with Dexie
Local-first approach ensures the app works offline and respects user privacy. All data stays on-device with no server required.

### HashRouter vs BrowserRouter
HashRouter is used for GitHub Pages compatibility, avoiding 404 errors on page refresh.

### Zustand for State
Lightweight state management with persistence to localStorage for theme and user preferences.

### Tailwind CSS
Utility-first CSS with custom design tokens for consistent dark theming.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <img src="public/heart.svg" width="60" height="60" alt="SmartLift Heart" />
  <p><b>SmartLift</b></p>
  <p>Track hard. Lift smart.</p>
  <p><i>Made with ❤️ for fitness enthusiasts<i></p>
</div>
