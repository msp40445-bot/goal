import { useState, useEffect } from 'react'
import { Activity, Heart, Moon, Zap, AlertCircle } from 'lucide-react'
import { isWhoopConnected, getWhoopSummary } from '../services/whoop'

export default function WhoopWidget() {
  const [connected] = useState(() => isWhoopConnected())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(() => isWhoopConnected())

  useEffect(() => {
    if (!connected) return
    let cancelled = false
    getWhoopSummary()
      .then(result => { if (!cancelled) setData(result) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [connected])

  if (!connected) {
    return (
      <div className="card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Health Data</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <AlertCircle className="w-3 h-3" />
          <span>Connect WHOOP in Integrations for health data</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-success" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Health Data</span>
        </div>
        <div className="shimmer h-16 rounded-lg" />
      </div>
    )
  }

  const recovery = data?.recovery
  const sleep = data?.sleep

  const getRecoveryColor = (score) => {
    if (!score) return '#5c5875'
    if (score >= 67) return '#22c55e'
    if (score >= 34) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-success" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">WHOOP</span>
        <div className="w-1.5 h-1.5 rounded-full bg-success pulse-dot ml-auto" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Recovery */}
        <div className="p-2 rounded-lg bg-surface-light border border-surface-border">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3" style={{ color: getRecoveryColor(recovery?.score) }} />
            <span className="text-[10px] text-text-muted">Recovery</span>
          </div>
          <div className="text-lg font-bold stat-number" style={{ color: getRecoveryColor(recovery?.score) }}>
            {recovery?.score != null ? `${recovery.score}%` : '--'}
          </div>
        </div>

        {/* Sleep */}
        <div className="p-2 rounded-lg bg-surface-light border border-surface-border">
          <div className="flex items-center gap-1 mb-1">
            <Moon className="w-3 h-3 text-primary-light" />
            <span className="text-[10px] text-text-muted">Sleep</span>
          </div>
          <div className="text-lg font-bold stat-number text-primary-light">
            {sleep?.performance != null ? `${sleep.performance}%` : '--'}
          </div>
        </div>

        {/* HRV */}
        <div className="p-2 rounded-lg bg-surface-light border border-surface-border">
          <div className="flex items-center gap-1 mb-1">
            <Heart className="w-3 h-3 text-danger" />
            <span className="text-[10px] text-text-muted">HRV</span>
          </div>
          <div className="text-sm font-bold stat-number text-text-primary">
            {recovery?.hrv != null ? `${Math.round(recovery.hrv)}ms` : '--'}
          </div>
        </div>

        {/* Resting HR */}
        <div className="p-2 rounded-lg bg-surface-light border border-surface-border">
          <div className="flex items-center gap-1 mb-1">
            <Heart className="w-3 h-3 text-warning" />
            <span className="text-[10px] text-text-muted">RHR</span>
          </div>
          <div className="text-sm font-bold stat-number text-text-primary">
            {recovery?.restingHR != null ? `${recovery.restingHR}` : '--'}
          </div>
        </div>
      </div>

      {data?.workouts?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-surface-border">
          <div className="text-[10px] text-text-muted mb-1">Recent Workouts</div>
          {data.workouts.slice(0, 2).map((w, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-0.5">
              <span className="text-text-secondary">{w.sport}</span>
              <span className="text-text-muted">{w.duration}min</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
