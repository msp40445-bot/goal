import { useState } from 'react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { categoryConfig } from '../../data/defaultGoals'
import { TrendingUp, TrendingDown, Minus, Calendar, Target, BarChart3 } from 'lucide-react'
import RadarChart from '../charts/RadarChart'
import WeeklyReview from '../WeeklyReview'

export default function AnalyticsPage({ goals, tasks, completionLog, streak, onAIReview }) {
  const [range, setRange] = useState(7)

  const now = new Date()
  const rangeStart = subDays(now, range)
  const days = eachDayOfInterval({ start: rangeStart, end: now })

  const dayData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const log = completionLog[dateStr]
    return {
      date: dateStr,
      label: format(day, 'EEE'),
      fullLabel: format(day, 'MMM d'),
      completed: log?.completed || 0,
      total: log?.total || 0,
      rate: log && log.total > 0 ? Math.round((log.completed / log.total) * 100) : 0
    }
  })

  const totalCompleted = dayData.reduce((s, d) => s + d.completed, 0)
  const totalTasks = dayData.reduce((s, d) => s + d.total, 0)
  const avgRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
  const maxTotal = Math.max(...dayData.map(d => d.total), 1)

  const firstHalf = dayData.slice(0, Math.floor(dayData.length / 2))
  const secondHalf = dayData.slice(Math.floor(dayData.length / 2))
  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, d) => s + d.rate, 0) / firstHalf.length : 0
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, d) => s + d.rate, 0) / secondHalf.length : 0
  const trend = Math.round(secondAvg - firstAvg)

  const categoryProgress = Object.entries(categoryConfig).map(([key, config]) => {
    const catGoals = goals.filter(g => g.category === key)
    const avgProgress = catGoals.length > 0
      ? Math.round(catGoals.reduce((s, g) => s + g.progress, 0) / catGoals.length)
      : 0
    const catTasks = tasks.filter(t => t.category === key)
    const catDone = catTasks.filter(t => t.completed).length
    return {
      key, label: config.label, color: config.color,
      goalCount: catGoals.length, avgProgress,
      tasksDone: catDone, tasksTotal: catTasks.length
    }
  })

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Analytics</h2>
          <p className="text-xs text-text-muted">Performance overview and trends</p>
        </div>
        <div className="flex bg-surface-light rounded-lg p-0.5 border border-surface-border">
          {[7, 14, 30].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === r ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-secondary'}`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-primary-light" />
            <span className="text-xs text-text-muted">Avg Completion</span>
          </div>
          <div className="text-2xl font-bold stat-number text-text-primary">{avgRate}%</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            {trend > 0 ? <TrendingUp className="w-4 h-4 text-success" /> : trend < 0 ? <TrendingDown className="w-4 h-4 text-danger" /> : <Minus className="w-4 h-4 text-text-muted" />}
            <span className="text-xs text-text-muted">Trend</span>
          </div>
          <div className={`text-2xl font-bold stat-number ${trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-text-muted'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-accent-light" />
            <span className="text-xs text-text-muted">Tasks Done</span>
          </div>
          <div className="text-2xl font-bold stat-number text-text-primary">{totalCompleted}</div>
          <div className="text-xs text-text-muted">of {totalTasks} total</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-warning" />
            <span className="text-xs text-text-muted">Streak</span>
          </div>
          <div className="text-2xl font-bold stat-number text-text-primary">{streak}</div>
          <div className="text-xs text-text-muted">consecutive days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart area */}
        <div className="lg:col-span-8 space-y-4">
          {/* Daily completion chart */}
          <div className="card p-4">
            <div className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-3">Daily Completion Rate</div>
            <div className="flex items-end gap-1" style={{ height: '180px' }}>
              {dayData.map((d, i) => {
                const isToday = d.date === format(now, 'yyyy-MM-dd')
                const barH = d.total > 0 ? Math.max((d.completed / maxTotal) * 100, 5) : 3
                const bgH = d.total > 0 ? Math.max((d.total / maxTotal) * 100, 5) : 3
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.fullLabel}: ${d.completed}/${d.total}`}>
                    <div className="text-[9px] text-text-muted">{d.rate}%</div>
                    <div className="w-full relative flex-1">
                      <div className="absolute bottom-0 w-full rounded-t bg-surface-lighter/50" style={{ height: `${bgH}%` }} />
                      <div
                        className={`absolute bottom-0 w-full rounded-t transition-all ${
                          d.rate >= 80 ? 'bg-success' : d.rate >= 50 ? 'bg-warning' : d.rate > 0 ? 'bg-warning/50' : 'bg-surface-lighter'
                        }`}
                        style={{ height: `${barH}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-primary-light font-semibold' : 'text-text-muted'}`}>
                      {range <= 14 ? d.label : (i % 3 === 0 ? d.label : '')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category progress */}
          <div className="card p-4">
            <div className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-3">Category Progress</div>
            <div className="space-y-3">
              {categoryProgress.map(cat => (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-text-primary font-medium">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>{cat.goalCount} goals</span>
                      <span>{cat.tasksDone}/{cat.tasksTotal} tasks</span>
                      <span className="font-semibold" style={{ color: cat.color }}>{cat.avgProgress}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-lighter rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.avgProgress}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-4">
          <RadarChart goals={goals} />
          <WeeklyReview goals={goals} tasks={tasks} completionLog={completionLog} onAIReview={onAIReview} />
        </div>
      </div>
    </div>
  )
}
