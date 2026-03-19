import { useState } from 'react'
import TaskList from '../TaskList'
import ActivityLog from '../ActivityLog'
import FocusTimer from '../FocusTimer'
import { categoryConfig } from '../../data/defaultGoals'
import { RotateCcw, Download, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'

export default function TasksPage({ tasks, onUpdateTasks, activityLogs, onAddActivityLog, onResetDaily }) {
  const [showStats, setShowStats] = useState(true)

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const categoryStats = Object.entries(categoryConfig).map(([key, config]) => {
    const catTasks = tasks.filter(t => t.category === key)
    const catCompleted = catTasks.filter(t => t.completed).length
    return {
      key,
      label: config.label,
      color: config.color,
      completed: catCompleted,
      total: catTasks.length,
      rate: catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0
    }
  })

  const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed)
  const medPriority = tasks.filter(t => t.priority === 'medium' && !t.completed)

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Daily Tasks</h2>
          <p className="text-xs text-text-muted">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-2 rounded-lg transition-colors ${showStats ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:bg-surface-light'}`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={onResetDaily}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-surface text-text-secondary border border-surface-border hover:bg-surface-light transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Day
          </button>
        </div>
      </div>

      {/* Overview stats */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
          <div className="card p-3">
            <div className="text-xl font-bold stat-number text-text-primary">{completionRate}%</div>
            <div className="text-xs text-text-muted">Today&apos;s Completion</div>
            <div className="mt-2 h-1.5 bg-surface-lighter rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#22c55e' : completionRate >= 50 ? '#f59e0b' : '#ef4444'
              }} />
            </div>
          </div>
          <div className="card p-3">
            <div className="text-xl font-bold stat-number text-danger">{highPriority.length}</div>
            <div className="text-xs text-text-muted">High Priority Left</div>
          </div>
          <div className="card p-3">
            <div className="text-xl font-bold stat-number text-warning">{medPriority.length}</div>
            <div className="text-xs text-text-muted">Medium Priority Left</div>
          </div>
          <div className="card p-3">
            <div className="text-xl font-bold stat-number text-success">{completedCount}</div>
            <div className="text-xs text-text-muted">Tasks Done Today</div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {showStats && (
        <div className="card p-3">
          <div className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">By Category</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categoryStats.map(cat => (
              <div key={cat.key} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary truncate">{cat.label}</span>
                    <span className="text-xs text-text-muted">{cat.completed}/{cat.total}</span>
                  </div>
                  <div className="h-1 bg-surface-lighter rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cat.rate}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main task list */}
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} onUpdate={onUpdateTasks} />
        </div>

        {/* Right side: Activity + Focus */}
        <div className="space-y-3">
          <FocusTimer onSessionComplete={() => {
            onAddActivityLog({
              id: `log-${Date.now()}`,
              content: 'Completed a focus session',
              category: 'growth',
              timestamp: new Date().toISOString()
            })
          }} />
          <ActivityLog logs={activityLogs} onAddLog={onAddActivityLog} />
        </div>
      </div>
    </div>
  )
}
