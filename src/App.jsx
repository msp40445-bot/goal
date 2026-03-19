import { useState, useEffect, useCallback } from 'react'
import { Plus, Zap, Search, Bell, RotateCcw } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { defaultGoals, defaultTasks, categoryConfig } from './data/defaultGoals'
import Timeline from './components/Timeline'
import StatsBar from './components/StatsBar'
import GoalCard from './components/GoalCard'
import TaskList from './components/TaskList'
import AIChat from './components/AIChat'
import AddGoalModal from './components/AddGoalModal'
import FocusTimer from './components/FocusTimer'
import ActivityLog from './components/ActivityLog'
import CommandBar from './components/CommandBar'
import MotivationalQuote from './components/MotivationalQuote'
import WeeklyReview from './components/WeeklyReview'
import StreakBadge from './components/StreakBadge'
import { getTaskBreakdown, getAISuggestion } from './services/ai'
import { requestNotificationPermission } from './services/notifications'
import { format } from 'date-fns'

function App() {
  const [goals, setGoals] = useLocalStorage('goalforge-goals', defaultGoals)
  const [tasks, setTasks] = useLocalStorage('goalforge-tasks', defaultTasks)
  const [completionLog, setCompletionLog] = useLocalStorage('goalforge-log', {})
  const [streak, setStreak] = useLocalStorage('goalforge-streak', 0)
  const [activityLogs, setActivityLogs] = useLocalStorage('goalforge-activity', [])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(perm => {
      setNotifEnabled(perm === 'granted')
    })
  }, [])

  // Track daily completion
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const completedCount = tasks.filter(t => t.completed).length
    const totalCount = tasks.length

    if (totalCount > 0) {
      setCompletionLog(prev => ({
        ...prev,
        [today]: { completed: completedCount, total: totalCount }
      }))
    }
  }, [tasks, setCompletionLog])

  // Calculate streak
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
    const yesterdayLog = completionLog[yesterday]

    if (yesterdayLog && yesterdayLog.completed / yesterdayLog.total >= 0.5) {
      const todayLog = completionLog[today]
      if (!todayLog || todayLog.completed === 0) {
        // Keep streak
      }
    }
  }, [completionLog])

  const updateGoal = useCallback((updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g))
  }, [setGoals])

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId))
  }

  const addGoal = (goal) => {
    setGoals(prev => [...prev, goal])
  }

  const addActivityLog = (log) => {
    setActivityLogs(prev => [...prev, log])
  }

  const resetDailyTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const completedCount = tasks.filter(t => t.completed).length
    const totalCount = tasks.length

    setCompletionLog(prev => ({
      ...prev,
      [today]: { completed: completedCount, total: totalCount }
    }))

    if (totalCount > 0 && completedCount / totalCount >= 0.5) {
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    setTasks(prev => prev.map(t => t.recurring ? { ...t, completed: false } : t))
  }

  const handleAIBreakdown = useCallback(async (goal) => {
    const response = await getTaskBreakdown(goal.title, goal.description, goal.milestones)
    const lines = response
      .split('\n')
      .map(l => l.replace(/^[-*\d.)\s]+/, '').trim())
      .filter(l => l.length > 3 && l.length < 100)

    if (lines.length > 0) {
      const newMilestones = lines.slice(0, 8).map((title, i) => ({
        id: `m-ai-${Date.now()}-${i}`,
        title,
        completed: false
      }))

      updateGoal({
        ...goal,
        milestones: [...goal.milestones, ...newMilestones]
      })
    }
  }, [updateGoal])

  const handleAIWeeklyReview = useCallback(async () => {
    const response = await getAISuggestion(goals, tasks, 'weekly')
    return response
  }, [goals, tasks])

  const handleCommand = useCallback((commandId) => {
    if (commandId === 'open-command-bar') {
      setCommandBarOpen(true)
      return
    }
    if (commandId === 'add-goal') {
      setShowAddGoal(true)
    } else if (commandId === 'add-task') {
      // Focus will be handled by the TaskList component's add button
    }
    // AI commands are handled via the CommandBar -> AIChat interaction
  }, [])

  const goalsByCategory = Object.keys(categoryConfig).reduce((acc, cat) => {
    acc[cat] = goals.filter(g => g.category === cat)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Bar */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary tracking-tight">GoalForge</h1>
              <p className="text-xs text-text-muted leading-none">Execute. Improve. Dominate.</p>
            </div>
          </div>

          {/* Center - Search trigger */}
          <button
            onClick={() => setCommandBarOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-light border border-surface-border rounded-lg text-xs text-text-muted hover:border-primary/30 transition-all w-64"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search or command...</span>
            <kbd className="px-1 py-0.5 bg-surface rounded text-xs border border-surface-border">&#8984;K</kbd>
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetDailyTasks}
              className="p-2 hover:bg-surface-light rounded-lg text-text-muted hover:text-text-secondary transition-colors"
              title="Reset daily tasks"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => requestNotificationPermission().then(p => setNotifEnabled(p === 'granted'))}
              className={`p-2 rounded-lg transition-colors ${notifEnabled ? 'text-success' : 'text-text-muted hover:text-text-secondary hover:bg-surface-light'}`}
              title={notifEnabled ? 'Notifications enabled' : 'Enable notifications'}
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Goal
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard - Dense 3-column layout */}
      <main className="max-w-screen-2xl mx-auto px-4 py-3">
        {/* Top row: Stats + Timeline */}
        <StatsBar goals={goals} tasks={tasks} streak={streak} />
        <Timeline completionLog={completionLog} />

        {/* Main 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

          {/* LEFT COLUMN - Goals (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Goals</span>
              <span className="text-xs text-text-muted">{goals.length} active</span>
            </div>

            <div className="space-y-2 max-h-screen overflow-y-auto pr-1">
              {Object.entries(categoryConfig).map(([catKey, catConfig]) => {
                const catGoals = goalsByCategory[catKey]
                if (!catGoals || catGoals.length === 0) return null
                return (
                  <div key={catKey}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catConfig.color }} />
                      <span className="text-xs font-medium" style={{ color: catConfig.color }}>{catConfig.label}</span>
                      <span className="text-xs text-text-muted">({catGoals.length})</span>
                    </div>
                    <div className="space-y-2">
                      {catGoals.map(goal => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          onUpdate={updateGoal}
                          onDelete={deleteGoal}
                          onAIBreakdown={handleAIBreakdown}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}

              {goals.length === 0 && (
                <div className="card p-6 text-center">
                  <p className="text-xs text-text-muted">No goals yet. Create your first goal to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN - Tasks + Activity (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <TaskList tasks={tasks} onUpdate={setTasks} />
            <ActivityLog logs={activityLogs} onAddLog={addActivityLog} />
            <MotivationalQuote />
          </div>

          {/* RIGHT COLUMN - AI + Tools (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <AIChat goals={goals} tasks={tasks} />
            <FocusTimer onSessionComplete={() => {
              addActivityLog({
                id: `log-${Date.now()}`,
                content: 'Completed a focus session',
                category: 'growth',
                timestamp: new Date().toISOString()
              })
            }} />
            <StreakBadge streak={streak} />
            <WeeklyReview
              goals={goals}
              tasks={tasks}
              completionLog={completionLog}
              onAIReview={handleAIWeeklyReview}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddGoal && (
        <AddGoalModal onAdd={addGoal} onClose={() => setShowAddGoal(false)} />
      )}

      <CommandBar
        open={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onCommand={handleCommand}
        goals={goals}
        tasks={tasks}
      />
    </div>
  )
}

export default App
