import { useState } from 'react'
import { Check, Circle, Plus, Trash2, Star, Clock, Filter } from 'lucide-react'
import { categoryConfig } from '../data/defaultGoals'

export default function TaskList({ tasks, onUpdate }) {
  const [newTask, setNewTask] = useState('')
  const [newCategory, setNewCategory] = useState('growth')
  const [newPriority, setNewPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(true)

  const toggleTask = (taskId) => {
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

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const priorityColors = {
    high: 'text-danger',
    medium: 'text-warning',
    low: 'text-text-secondary'
  }

  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-light" />
            Daily Tasks
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {completedCount}/{totalCount} completed ({completionRate}%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`text-xs px-2 py-1 rounded ${
              showCompleted ? 'bg-surface-light text-text-secondary' : 'bg-primary/20 text-primary-light'
            }`}
          >
            {showCompleted ? 'Hide Done' : 'Show Done'}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-3 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary hover:bg-surface-lighter'
          }`}
        >
          All
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              filter === key ? 'text-white' : 'bg-surface-light text-text-secondary hover:bg-surface-lighter'
            }`}
            style={filter === key ? { backgroundColor: config.color } : {}}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div className="h-2 bg-surface-light rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-success to-success/70 rounded-full transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filteredTasks.map((task) => {
          const config = categoryConfig[task.category] || { color: '#6366f1' }
          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-2 rounded-lg group transition-colors ${
                task.completed ? 'bg-surface-light/30' : 'bg-surface-light/50 hover:bg-surface-light'
              }`}
            >
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                {task.completed ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-text-secondary" />
                )}
              </button>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className={`flex-1 text-sm ${
                task.completed ? 'line-through text-text-secondary/60' : 'text-text-primary'
              }`}>
                {task.title}
              </span>
              <Star className={`w-3 h-3 flex-shrink-0 ${priorityColors[task.priority]}`} />
              {task.recurring && (
                <span className="text-xs text-text-secondary/50">recurring</span>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 text-danger/70" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 bg-surface-light rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-surface-lighter focus:border-primary focus:outline-none"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-2 py-2 bg-surface-light rounded-lg text-sm text-text-primary border border-surface-lighter focus:border-primary focus:outline-none"
        >
          {Object.entries(categoryConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          className="px-2 py-2 bg-surface-light rounded-lg text-sm text-text-primary border border-surface-lighter focus:border-primary focus:outline-none"
        >
          <option value="high">High</option>
          <option value="medium">Med</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={addTask}
          className="px-3 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
