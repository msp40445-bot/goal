import { TrendingUp, Target, CheckCircle, Flame } from 'lucide-react'

export default function StatsBar({ goals, tasks, streak }) {
  const totalGoals = goals.length
  const avgProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0

  const completedToday = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length

  const stats = [
    {
      icon: Target,
      label: 'Active Goals',
      value: totalGoals,
      color: 'text-primary-light',
      bg: 'bg-primary/20'
    },
    {
      icon: TrendingUp,
      label: 'Avg Progress',
      value: `${avgProgress}%`,
      color: 'text-success',
      bg: 'bg-success/20'
    },
    {
      icon: CheckCircle,
      label: 'Tasks Done',
      value: `${completedToday}/${totalTasks}`,
      color: 'text-warning',
      bg: 'bg-warning/20'
    },
    {
      icon: Flame,
      label: 'Day Streak',
      value: streak,
      color: 'text-danger',
      bg: 'bg-danger/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-surface rounded-xl p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${stat.bg}`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-secondary">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
