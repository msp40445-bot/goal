import { useState } from 'react'
import { X, Plus, Sparkles } from 'lucide-react'
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-xl w-full max-w-md shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-light" />
            <h3 className="text-sm font-semibold text-text-primary">New Goal</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-light rounded-lg transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master PCB Design"
              className="input-sharp w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this goal involve?"
              rows={2}
              className="input-sharp w-full resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    category === key
                      ? 'text-white border-transparent'
                      : 'bg-surface-light text-text-secondary border-surface-border hover:border-surface-lighter'
                  }`}
                  style={category === key ? { backgroundColor: config.color } : {}}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Timeline</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: 3, label: '3 months' },
                { value: 6, label: '6 months' },
                { value: 12, label: '1 year' },
                { value: 24, label: '2 years' },
                { value: 36, label: '3 years' },
                { value: 60, label: '5 years' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMonths(opt.value)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    months === opt.value
                      ? 'bg-primary/20 text-primary-light border-primary/30'
                      : 'bg-surface-light text-text-muted border-surface-border hover:text-text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Create Goal
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
