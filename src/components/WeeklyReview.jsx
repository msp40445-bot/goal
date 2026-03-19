import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Minus, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { categoryConfig } from '../data/defaultGoals'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export default function WeeklyReview({ goals, tasks, completionLog, onAIReview }) {
  const [expanded, setExpanded] = useState(false)
  const [aiReview, setAiReview] = useState('')
  const [loading, setLoading] = useState(false)

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weekData = weekDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const log = completionLog[dateStr]
    return {
      day: format(day, 'EEE'),
      date: dateStr,
      completed: log?.completed || 0,
      total: log?.total || 0,
      rate: log ? Math.round((log.completed / log.total) * 100) : 0
    }
  })

  const totalCompleted = weekData.reduce((sum, d) => sum + d.completed, 0)
  const totalTasks = weekData.reduce((sum, d) => sum + d.total, 0)
  const weeklyRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  const categoryBreakdown = Object.entries(categoryConfig).map(([key, config]) => {
    const catGoals = goals.filter(g => g.category === key)
    const avgProgress = catGoals.length > 0
      ? Math.round(catGoals.reduce((sum, g) => sum + g.progress, 0) / catGoals.length)
      : 0
    const catTasks = tasks.filter(t => t.category === key)
    const catCompleted = catTasks.filter(t => t.completed).length

    return {
      key,
      label: config.label,
      color: config.color,
      goalCount: catGoals.length,
      avgProgress,
      tasksCompleted: catCompleted,
      totalTasks: catTasks.length
    }
  })

  const trend = weekData.length >= 2
    ? weekData[weekData.length - 1].rate - weekData[0].rate
    : 0

  const handleAIReview = async () => {
    setLoading(true)
    try {
      const review = await onAIReview()
      setAiReview(review)
    } catch {
      setAiReview('AI is offline. Connect Ollama to get your weekly review.')
    }
    setLoading(false)
  }

  const maxBarValue = Math.max(...weekData.map(d => d.total), 1)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Weekly Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3 text-danger" />
            ) : (
              <Minus className="w-3 h-3 text-text-muted" />
            )}
            <span className={`text-xs font-medium ${trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-text-muted'}`}>
              {weeklyRate}%
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-surface-light rounded transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3 text-text-muted" /> : <ChevronDown className="w-3 h-3 text-text-muted" />}
          </button>
        </div>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-16 mb-2">
        {weekData.map((d, i) => {
          const isToday = d.date === format(now, 'yyyy-MM-dd')
          const height = d.total > 0 ? Math.max((d.completed / maxBarValue) * 100, 8) : 4
          const bgHeight = d.total > 0 ? Math.max((d.total / maxBarValue) * 100, 8) : 4
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full relative" style={{ height: '48px' }}>
                <div
                  className="absolute bottom-0 w-full rounded-sm bg-surface-lighter/50"
                  style={{ height: `${bgHeight}%` }}
                />
                <div
                  className={`absolute bottom-0 w-full rounded-sm transition-all ${
                    d.rate >= 80 ? 'bg-success' : d.rate >= 50 ? 'bg-warning' : d.rate > 0 ? 'bg-warning/50' : 'bg-surface-lighter'
                  }`}
                  style={{ height: `${height}%` }}
                />
                {isToday && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-light" />
                )}
              </div>
              <span className={`text-xs ${isToday ? 'text-primary-light font-semibold' : 'text-text-muted'}`}>
                {d.day.charAt(0)}
              </span>
            </div>
          )
        })}
      </div>

      {expanded && (
        <div className="animate-slide-up">
          {/* Category breakdown */}
          <div className="space-y-2 mb-3 pt-3 border-t border-surface-border">
            <div className="text-xs text-text-muted font-medium mb-1">By Category</div>
            {categoryBreakdown.map(cat => (
              <div key={cat.key} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-text-secondary flex-1">{cat.label}</span>
                <div className="w-16 h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${cat.avgProgress}%`, backgroundColor: cat.color }}
                  />
                </div>
                <span className="text-xs text-text-muted w-8 text-right">{cat.avgProgress}%</span>
              </div>
            ))}
          </div>

          {/* AI Review Button */}
          <button
            onClick={handleAIReview}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 transition-all text-xs font-medium disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            {loading ? 'Analyzing...' : 'Get AI Weekly Review'}
          </button>

          {aiReview && (
            <div className="mt-3 p-3 rounded-lg bg-surface-light border border-surface-border">
              <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{aiReview}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
