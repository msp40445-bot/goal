import { Flame, Trophy, Star, Zap, Crown } from 'lucide-react'

const BADGES = [
  { threshold: 3, label: 'Spark', icon: Zap, color: '#f59e0b' },
  { threshold: 7, label: 'On Fire', icon: Flame, color: '#ef4444' },
  { threshold: 14, label: 'Warrior', icon: Star, color: '#8b5cf6' },
  { threshold: 30, label: 'Champion', icon: Trophy, color: '#22c55e' },
  { threshold: 60, label: 'Legend', icon: Crown, color: '#6366f1' },
  { threshold: 100, label: 'Unstoppable', icon: Crown, color: '#ec4899' },
]

export default function StreakBadge({ streak }) {
  const currentBadge = [...BADGES].reverse().find(b => streak >= b.threshold)
  const nextBadge = BADGES.find(b => streak < b.threshold)

  if (streak < 1) {
    return (
      <div className="card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Streak</span>
        </div>
        <p className="text-xs text-text-muted">Complete 50%+ of your daily tasks to start a streak!</p>
      </div>
    )
  }

  const Icon = currentBadge ? currentBadge.icon : Flame
  const badgeColor = currentBadge ? currentBadge.color : '#f59e0b'
  const badgeLabel = currentBadge ? currentBadge.label : 'Starting'

  return (
    <div className="card p-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <Icon className="w-20 h-20" style={{ color: badgeColor }} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${badgeColor}20` }}>
          <Icon className="w-4 h-4" style={{ color: badgeColor }} />
        </div>
        <div>
          <div className="text-lg font-bold stat-number text-text-primary">{streak}</div>
          <div className="text-xs text-text-muted -mt-0.5">day streak</div>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor
          }}>
            {badgeLabel}
          </span>
        </div>
      </div>

      {nextBadge && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Next: {nextBadge.label}</span>
            <span className="text-xs text-text-muted">{nextBadge.threshold - streak} days</span>
          </div>
          <div className="h-1 bg-surface-lighter rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((streak / nextBadge.threshold) * 100, 100)}%`,
                backgroundColor: badgeColor
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
