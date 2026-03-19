import { useState, useEffect, useCallback } from 'react'
import { Search, Zap } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { defaultGoals, defaultTasks } from './data/defaultGoals'
import NavDock from './components/NavDock'
import DashboardPage from './components/pages/DashboardPage'
import GoalsPage from './components/pages/GoalsPage'
import TasksPage from './components/pages/TasksPage'
import AICoachPage from './components/pages/AICoachPage'
import AnalyticsPage from './components/pages/AnalyticsPage'
import IntegrationsPage from './components/pages/IntegrationsPage'
import AddGoalModal from './components/AddGoalModal'
import CommandBar from './components/CommandBar'
import { getTaskBreakdown, getAISuggestion } from './services/ai'
import { requestNotificationPermission } from './services/notifications'
import { format } from 'date-fns'

function App() {
  const [goals, setGoals] = useLocalStorage('goalforge-goals', defaultGoals)
  const [tasks, setTasks] = useLocalStorage('goalforge-tasks', defaultTasks)
  const [completionLog, setCompletionLog] = useLocalStorage('goalforge-log', {})
  const [streak, setStreak] = useLocalStorage('goalforge-streak', 0)
  const [activityLogs, setActivityLogs] = useLocalStorage('goalforge-activity', [])
  const [activePage, setActivePage] = useState('dashboard')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [commandBarOpen, setCommandBarOpen] = useState(false)

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
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
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
    const yesterdayLog = completionLog[yesterday]

    if (yesterdayLog && yesterdayLog.completed / yesterdayLog.total >= 0.5) {
      // Streak continues
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
    }
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            goals={goals}
            tasks={tasks}
            streak={streak}
            completionLog={completionLog}
            onUpdateTasks={setTasks}
            onAddActivityLog={addActivityLog}
          />
        )
      case 'goals':
        return (
          <GoalsPage
            goals={goals}
            onUpdate={updateGoal}
            onDelete={deleteGoal}
            onAIBreakdown={handleAIBreakdown}
            onAddGoal={() => setShowAddGoal(true)}
          />
        )
      case 'tasks':
        return (
          <TasksPage
            tasks={tasks}
            onUpdateTasks={setTasks}
            activityLogs={activityLogs}
            onAddActivityLog={addActivityLog}
            onResetDaily={resetDailyTasks}
            completionLog={completionLog}
          />
        )
      case 'ai':
        return <AICoachPage goals={goals} tasks={tasks} />
      case 'analytics':
        return (
          <AnalyticsPage
            goals={goals}
            tasks={tasks}
            completionLog={completionLog}
            streak={streak}
            onAIReview={handleAIWeeklyReview}
          />
        )
      case 'integrations':
        return <IntegrationsPage />
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg">
      {/* Top bar */}
      <header className="page-header flex-shrink-0">
        <div className="page-title">
          <div className="page-title-logo">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1>GoalForge</h1>
            <span>Execute. Improve. Dominate.</span>
          </div>
        </div>

        <button
          onClick={() => setCommandBarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-light border border-surface-border rounded-lg text-xs text-text-muted hover:border-primary/30 transition-all w-56"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="px-1 py-0.5 bg-surface rounded text-[10px] border border-surface-border">&#8984;K</kbd>
        </button>
      </header>

      {/* Scrollable page content — extra bottom padding for dock */}
      <main className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        {renderPage()}
      </main>

      {/* Floating nav dock */}
      <NavDock activePage={activePage} onNavigate={setActivePage} />

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
