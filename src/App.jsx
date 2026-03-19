import { useState, useEffect } from 'react'
import { Plus, Zap, Menu, X } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { defaultGoals, defaultTasks, categoryConfig } from './data/defaultGoals'
import Timeline from './components/Timeline'
import StatsBar from './components/StatsBar'
import GoalCard from './components/GoalCard'
import TaskList from './components/TaskList'
import AIChat from './components/AIChat'
import AddGoalModal from './components/AddGoalModal'
import { format } from 'date-fns'

function App() {
  const [goals, setGoals] = useLocalStorage('goalforge-goals', defaultGoals)
  const [tasks, setTasks] = useLocalStorage('goalforge-tasks', defaultTasks)
  const [completionLog, setCompletionLog] = useLocalStorage('goalforge-log', {})
  const [streak, setStreak] = useLocalStorage('goalforge-streak', 0)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [activeTab, setActiveTab] = useState('goals')
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  const updateGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g))
  }

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId))
  }

  const addGoal = (goal) => {
    setGoals(prev => [...prev, goal])
  }

  const resetDailyTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const completedCount = tasks.filter(t => t.completed).length
    const totalCount = tasks.length

    setCompletionLog(prev => ({
      ...prev,
      [today]: { completed: completedCount, total: totalCount }
    }))

    if (completedCount / totalCount >= 0.5) {
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    setTasks(prev => prev.map(t => t.recurring ? { ...t, completed: false } : t))
  }

  const goalsByCategory = Object.keys(categoryConfig).reduce((acc, cat) => {
    acc[cat] = goals.filter(g => g.category === cat)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-surface-light sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">GoalForge</h1>
              <p className="text-xs text-text-secondary">10% better every day</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDailyTasks}
              className="px-3 py-1.5 bg-surface-light hover:bg-surface-lighter rounded-lg text-xs text-text-secondary transition-colors"
            >
              Reset Daily
            </button>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-dark rounded-lg text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Goal
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-surface-light rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-text-secondary" /> : <Menu className="w-5 h-5 text-text-secondary" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Timeline */}
        <Timeline completionLog={completionLog} />

        {/* Stats */}
        <StatsBar goals={goals} tasks={tasks} streak={streak} />

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
          {[
            { id: 'goals', label: 'Goals' },
            { id: 'tasks', label: 'Daily Tasks' },
            { id: 'ai', label: 'AI Assistant' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className={`${activeTab === 'ai' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            {activeTab === 'goals' && (
              <div className="space-y-4">
                {Object.entries(categoryConfig).map(([catKey, catConfig]) => {
                  const catGoals = goalsByCategory[catKey]
                  if (!catGoals || catGoals.length === 0) return null
                  return (
                    <div key={catKey}>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: catConfig.color }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catConfig.color }} />
                        {catConfig.label}
                      </h3>
                      <div className="space-y-3">
                        {catGoals.map(goal => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            onUpdate={updateGoal}
                            onDelete={deleteGoal}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}

                {goals.length === 0 && (
                  <div className="bg-surface rounded-xl p-8 text-center">
                    <p className="text-text-secondary">No goals yet. Click "New Goal" to get started!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <TaskList tasks={tasks} onUpdate={setTasks} />
            )}

            {activeTab === 'ai' && (
              <AIChat goals={goals} tasks={tasks} />
            )}
          </div>

          {/* Sidebar - Quick Tasks on Goals view */}
          {activeTab === 'goals' && (
            <div className="hidden lg:block">
              <TaskList tasks={tasks} onUpdate={setTasks} />
            </div>
          )}

          {/* Sidebar - AI on Tasks view */}
          {activeTab === 'tasks' && (
            <div className="hidden lg:block">
              <AIChat goals={goals} tasks={tasks} />
            </div>
          )}
        </div>
      </main>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <AddGoalModal onAdd={addGoal} onClose={() => setShowAddGoal(false)} />
      )}
    </div>
  )
}

export default App
