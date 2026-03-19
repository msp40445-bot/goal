import { Target, CheckCircle, Flame, Zap } from 'lucide-react'

export default function StatsBar({ goals, tasks, streak }) {
  const totalGoals = goals.length
  const avgProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0

  const completedToday = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0

  const highPriorityDone = tasks.filter(t => t.priority === 'high' && t.completed).length
  const highPriorityTotal = tasks.filter(t => t.priority === 'high').length

  const stats = [
    {
      icon: Target,
      label: 'Goals',
      value: totalGoals,
      sub: `${avgProgress}% avg`,
      color: '#6366f1',
    },
    {
      icon: CheckCircle,
      label: 'Tasks',
      value: `${completedToday}/${totalTasks}`,
      sub: `${completionRate}%`,
      color: completionRate >= 80 ? '#22c55e' : completionRate >= 50 ? '#f59e0b' : '#ef4444',
    },
    {
      icon: Zap,
      label: 'Priority',
      value: `${highPriorityDone}/${highPriorityTotal}`,
      sub: 'high tasks',
      color: '#ef4444',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: streak,
      sub: streak === 1 ? 'day' : 'days',
      color: streak >= 7 ? '#22c55e' : '#f59e0b',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {stats.map((stat, i) => (
        <div key={i} className="card p-3 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold stat-number text-text-primary leading-tight">{stat.value}</div>
            <div className="text-xs text-text-muted leading-tight">{stat.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
