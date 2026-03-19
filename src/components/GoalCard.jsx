import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Circle, Trash2, Plus } from 'lucide-react'
import { categoryConfig } from '../data/defaultGoals'

export default function GoalCard({ goal, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const config = categoryConfig[goal.category] || { label: 'Other', color: '#6366f1' }

  const completedMilestones = goal.milestones.filter(m => m.completed).length
  const totalMilestones = goal.milestones.length
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const toggleMilestone = (milestoneId) => {
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    )
    const completed = updatedMilestones.filter(m => m.completed).length
    const newProgress = updatedMilestones.length > 0 ? Math.round((completed / updatedMilestones.length) * 100) : 0
    onUpdate({ ...goal, milestones: updatedMilestones, progress: newProgress })
  }

  const addMilestone = () => {
    if (!newMilestone.trim()) return
    const milestone = {
      id: `m-${Date.now()}`,
      title: newMilestone.trim(),
      completed: false
    }
    onUpdate({ ...goal, milestones: [...goal.milestones, milestone] })
    setNewMilestone('')
  }

  const deleteMilestone = (milestoneId) => {
    const updatedMilestones = goal.milestones.filter(m => m.id !== milestoneId)
    const completed = updatedMilestones.filter(m => m.completed).length
    const newProgress = updatedMilestones.length > 0 ? Math.round((completed / updatedMilestones.length) * 100) : 0
    onUpdate({ ...goal, milestones: updatedMilestones, progress: newProgress })
  }

  return (
    <div className="bg-surface rounded-xl overflow-hidden transition-all hover:ring-1 hover:ring-surface-lighter">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs font-medium" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-text-primary">{goal.title}</h3>
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{goal.description}</p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: config.color }}>
                {progress}%
              </div>
              <div className="text-xs text-text-secondary">
                {completedMilestones}/{totalMilestones}
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="h-2 bg-surface-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: config.color }}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-light">
          <div className="mt-3 space-y-2">
            {goal.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-surface-light/50 hover:bg-surface-light group"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMilestone(milestone.id) }}
                  className="flex-shrink-0"
                >
                  {milestone.completed ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-text-secondary" />
                  )}
                </button>
                <span className={`flex-1 text-sm ${
                  milestone.completed ? 'line-through text-text-secondary' : 'text-text-primary'
                }`}>
                  {milestone.title}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMilestone(milestone.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
              placeholder="Add a milestone..."
              className="flex-1 px-3 py-2 bg-surface-light rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-surface-lighter focus:border-primary focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); addMilestone() }}
              className="px-3 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(goal.id) }}
              className="flex items-center gap-1 text-xs text-danger/70 hover:text-danger transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Goal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
