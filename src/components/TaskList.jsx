import { useState } from 'react'
import { Check, Circle, Plus, Trash2, Clock, Repeat, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { categoryConfig } from '../data/defaultGoals'
import { playAlarmSound } from '../services/notifications'

export default function TaskList({ tasks, onUpdate, compact }) {
  const [newTask, setNewTask] = useState('')
  const [newCategory, setNewCategory] = useState('growth')
  const [newPriority, setNewPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const toggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && !task.completed) {
      try { playAlarmSound('complete') } catch { /* audio not available */ }
    }
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
    onUpdate(updated)
  }

  const addTask = () => {
    if (!newTask.trim()) return
    const task = {
      id: `t-${Date.now()}`,
      title: newTask.trim(),
      category: newCategory,
      completed: false,
      recurring: false,
      priority: newPriority
    }
    onUpdate([...tasks, task])
    setNewTask('')
  }

  const deleteTask = (taskId) => {
    onUpdate(tasks.filter(t => t.id !== taskId))
  }

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false
    if (!showCompleted && t.completed) return false
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
  })

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const highPriorityPending = tasks.filter(t => t.priority === 'high' && !t.completed).length

  const priorityIndicator = (priority) => {
    if (priority === 'high') return 'bg-danger'
    if (priority === 'medium') return 'bg-warning'
    return 'bg-text-muted'
  }

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-light" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Daily Tasks</span>
          <span className="text-xs stat-number font-bold text-text-muted">{completedCount}/{totalCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {highPriorityPending > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-danger">
              <AlertTriangle className="w-3 h-3" /> {highPriorityPending}
            </span>
          )}
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
              showCompleted ? 'text-text-muted hover:text-text-secondary' : 'bg-primary/20 text-primary-light'
            }`}
          >
            {showCompleted ? 'Hide done' : 'Show all'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${completionRate}%`,
            background: completionRate === 100
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : completionRate >= 50
                ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          }}
        />
      </div>

      {/* Category filters */}
      {!compact && (
        <div className="flex gap-0.5 mb-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            All
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                filter === key ? 'text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
              style={filter === key ? { backgroundColor: config.color } : {}}
            >
              {config.label.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-0.5 max-h-80 overflow-y-auto">
        {sortedTasks.map((task) => {
          const config = categoryConfig[task.category] || { color: '#6366f1' }
          return (
            <div
              key={task.id}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-lg group transition-all ${
                task.completed ? 'opacity-40' : 'hover:bg-surface-light'
              }`}
            >
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                {task.completed ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Circle className="w-4 h-4 text-text-muted" />
                )}
              </button>
              <div className={`w-1 h-4 rounded-full flex-shrink-0 ${priorityIndicator(task.priority)}`} />
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className={`flex-1 text-xs ${
                task.completed ? 'line-through text-text-muted' : 'text-text-primary'
              }`}>
                {task.title}
              </span>
              {task.recurring && (
                <Repeat className="w-3 h-3 text-text-muted flex-shrink-0" />
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Trash2 className="w-3 h-3 text-danger/50" />
              </button>
            </div>
          )
        })}

        {sortedTasks.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">No tasks to show</p>
        )}
      </div>

      {/* Add task */}
      <div className="mt-2 pt-2 border-t border-surface-border">
        {showAdd ? (
          <div className="space-y-1.5 animate-slide-up">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to be done?"
              className="input-sharp w-full text-xs"
              autoFocus
            />
            <div className="flex gap-1.5">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input-sharp text-xs flex-1"
              >
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="input-sharp text-xs w-16"
              >
                <option value="high">High</option>
                <option value="medium">Med</option>
                <option value="low">Low</option>
              </select>
              <button
                onClick={addTask}
                className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary-light transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => setShowAdd(false)}
              className="text-xs text-text-muted hover:text-text-secondary w-full text-center py-0.5"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-light transition-colors w-full py-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add task
          </button>
        )}
      </div>
    </div>
  )
}
