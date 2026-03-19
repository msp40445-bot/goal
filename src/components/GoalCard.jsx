import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Circle, Trash2, Plus, Sparkles, Calendar } from 'lucide-react'
import { categoryConfig } from '../data/defaultGoals'
import { differenceInDays } from 'date-fns'

export default function GoalCard({ goal, onUpdate, onDelete, onAIBreakdown }) {
  const [expanded, setExpanded] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const config = categoryConfig[goal.category] || { label: 'Other', color: '#6366f1' }

  const completedMilestones = goal.milestones.filter(m => m.completed).length
  const totalMilestones = goal.milestones.length
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const daysLeft = goal.targetDate ? differenceInDays(new Date(goal.targetDate), new Date()) : null
  const totalDays = goal.startDate && goal.targetDate
    ? differenceInDays(new Date(goal.targetDate), new Date(goal.startDate))
    : null
  const timeProgress = totalDays && totalDays > 0 ? Math.round(((totalDays - (daysLeft || 0)) / totalDays) * 100) : 0

  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (progress / 100) * circumference

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

  const handleAIBreakdown = async (e) => {
    e.stopPropagation()
    if (!onAIBreakdown || aiLoading) return
    setAiLoading(true)
    try {
      await onAIBreakdown(goal)
    } catch {
      // AI offline
    }
    setAiLoading(false)
  }

  return (
    <div className="card overflow-hidden animate-slide-up">
      <div
        className="p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Progress Ring */}
          <div className="relative w-11 h-11 flex-shrink-0">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" strokeWidth="2.5"
                className="stroke-surface-lighter" />
              <circle cx="20" cy="20" r="18" fill="none" strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  stroke: config.color,
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 0.5s ease'
                }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold stat-number" style={{ color: config.color }}>
                {progress}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-xs font-medium text-text-muted">{config.label}</span>
              {daysLeft !== null && (
                <span className="text-xs text-text-muted ml-auto flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-text-primary leading-tight">{goal.title}</h3>
            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{goal.description}</p>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <span className="text-xs text-text-muted">{completedMilestones}/{totalMilestones}</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            )}
          </div>
        </div>

        {/* Time progress bar */}
        {totalDays > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-surface-lighter rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${timeProgress}%`,
                  backgroundColor: timeProgress > progress + 20 ? '#ef4444' : config.color,
                  opacity: 0.6
                }}
              />
            </div>
            <span className="text-xs text-text-muted">{timeProgress}% time</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-surface-border animate-slide-up">
          <div className="mt-2 space-y-1">
            {goal.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-light group transition-colors"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMilestone(milestone.id) }}
                  className="flex-shrink-0"
                >
                  {milestone.completed ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Circle className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                <span className={`flex-1 text-xs ${
                  milestone.completed ? 'line-through text-text-muted' : 'text-text-primary'
                }`}>
                  {milestone.title}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMilestone(milestone.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-danger/70" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2 flex gap-1.5">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
              placeholder="Add milestone..."
              className="input-sharp flex-1 text-xs"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); addMilestone() }}
              className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary-light transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleAIBreakdown}
              disabled={aiLoading}
              className="flex items-center gap-1 text-xs text-primary-light/70 hover:text-primary-light transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" /> {aiLoading ? 'Thinking...' : 'AI Breakdown'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(goal.id) }}
              className="flex items-center gap-1 text-xs text-danger/50 hover:text-danger transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
