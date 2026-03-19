import { useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from 'lucide-react'
import { playAlarmSound, sendNotification } from '../services/notifications'

const PRESETS = [
  { label: '25m', minutes: 25, type: 'focus', icon: Zap },
  { label: '50m', minutes: 50, type: 'focus', icon: Zap },
  { label: '5m', minutes: 5, type: 'break', icon: Coffee },
  { label: '15m', minutes: 15, type: 'break', icon: Coffee },
]

export default function FocusTimer({ onSessionComplete }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [totalTime, setTotalTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState('focus')
  const [sessionsCompleted, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const toggleTimer = () => {
    if (isRunning) {
      // Pause
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsRunning(false)
    } else {
      // Start
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsRunning(true)
      const currentSessionType = sessionType
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setIsRunning(false)
            playAlarmSound('alarm')
            sendNotification(
              currentSessionType === 'focus' ? 'Focus session complete!' : 'Break is over!',
              currentSessionType === 'focus' ? 'Great work! Take a break.' : 'Time to focus again!'
            )
            if (currentSessionType === 'focus') {
              setSessions(p => p + 1)
              if (onSessionComplete) onSessionComplete()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const setPreset = (preset) => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setTimeLeft(preset.minutes * 60)
    setTotalTime(preset.minutes * 60)
    setSessionType(preset.type)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setTimeLeft(totalTime)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  const circumference = 2 * Math.PI * 38
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary-light" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Focus Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-xs text-text-muted">{sessionsCompleted} sessions</div>
        </div>
      </div>

      <div className="flex items-center justify-center py-3">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="38" fill="none" strokeWidth="3"
              className="stroke-surface-lighter" />
            <circle cx="40" cy="40" r="38" fill="none" strokeWidth="3"
              strokeLinecap="round"
              className={sessionType === 'focus' ? 'stroke-primary' : 'stroke-success'}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease'
              }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold stat-number text-text-primary">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-text-muted capitalize">{sessionType}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={toggleTimer}
          className={`p-2 rounded-lg transition-all ${
            isRunning
              ? 'bg-warning/20 text-warning hover:bg-warning/30'
              : 'bg-primary/20 text-primary-light hover:bg-primary/30'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-surface-light text-text-secondary hover:bg-surface-lighter transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setPreset(preset)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              totalTime === preset.minutes * 60 && sessionType === preset.type
                ? preset.type === 'focus'
                  ? 'bg-primary/20 text-primary-light'
                  : 'bg-success/20 text-success'
                : 'bg-surface-light text-text-muted hover:text-text-secondary hover:bg-surface-lighter'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
