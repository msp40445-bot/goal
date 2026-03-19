import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { categoryConfig } from '../data/defaultGoals'

export default function AddGoalModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('tech')
  const [months, setMonths] = useState(12)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const goal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      progress: 0,
      startDate: new Date().toISOString(),
      targetDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: []
    }

    onAdd(goal)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-surface-light">
          <h3 className="text-lg font-semibold text-text-primary">New Goal</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-light rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master PCB Design"
              className="w-full px-3 py-2 bg-surface-light rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-surface-lighter focus:border-primary focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this goal involve?"
              rows={3}
              className="w-full px-3 py-2 bg-surface-light rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-surface-lighter focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === key
                      ? 'text-white ring-2 ring-offset-2 ring-offset-surface'
                      : 'bg-surface-light text-text-secondary hover:bg-surface-lighter'
                  }`}
                  style={category === key ? { backgroundColor: config.color, ringColor: config.color } : {}}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Timeline</label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-light rounded-lg text-sm text-text-primary border border-surface-lighter focus:border-primary focus:outline-none"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>1 year</option>
              <option value={24}>2 years</option>
              <option value={36}>3 years</option>
              <option value={60}>5 years</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        </form>
      </div>
    </div>
  )
}
