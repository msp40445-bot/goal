import { useState, useRef, useEffect } from 'react'
import { format, startOfYear, endOfYear, eachMonthOfInterval, differenceInDays, addYears, isToday, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { Calendar } from 'lucide-react'

export default function Timeline({ completionLog }) {
  const [yearSpan, setYearSpan] = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const scrollRef = useRef(null)
  const todayRef = useRef(null)

  const now = new Date()
  const start = startOfYear(now)
  const end = endOfYear(addYears(now, yearSpan - 1))
  const totalDays = differenceInDays(end, start) + 1
  const daysSoFar = differenceInDays(now, start)
  const progressPercent = Math.round((daysSoFar / totalDays) * 100)

  const months = eachMonthOfInterval({ start, end })

  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current
      const todayEl = todayRef.current
      const containerWidth = container.offsetWidth
      const todayLeft = todayEl.offsetLeft
      container.scrollLeft = todayLeft - containerWidth / 2
    }
  }, [yearSpan])

  const getDateColor = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = completionLog[dateStr]
    if (!log) {
      if (date < now && !isToday(date)) return 'bg-surface-lighter/30'
      return 'bg-surface-lighter/50'
    }
    const rate = log.completed / log.total
    if (rate >= 0.8) return 'bg-success'
    if (rate >= 0.5) return 'bg-warning'
    if (rate > 0) return 'bg-warning/50'
    return 'bg-danger/50'
  }

  const getDateTooltip = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = completionLog[dateStr]
    if (!log) return format(date, 'MMM d, yyyy')
    return `${format(date, 'MMM d, yyyy')}: ${log.completed}/${log.total} tasks`
  }

  return (
    <div className="bg-surface rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-light" />
          <h2 className="text-lg font-semibold text-text-primary">Year Timeline</h2>
          <span className="text-sm text-text-secondary">
            Day {daysSoFar} of {totalDays} ({progressPercent}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 3, 5, 10].map(span => (
            <button
              key={span}
              onClick={() => setYearSpan(span)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                yearSpan === span
                  ? 'bg-primary text-white'
                  : 'bg-surface-light text-text-secondary hover:bg-surface-lighter'
              }`}
            >
              {span}Y
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="h-3 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="flex gap-1" style={{ minWidth: `${months.length * 120}px` }}>
          {months.map((month, i) => {
            const daysInMonth = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month)
            })
            const isCurrentMonth = isSameMonth(month, now)

            return (
              <div key={i} className="flex-shrink-0">
                <div className={`text-xs font-medium mb-1 px-1 ${
                  isCurrentMonth ? 'text-primary-light' : 'text-text-secondary'
                }`}>
                  {format(month, yearSpan > 3 ? 'MMM yy' : 'MMMM yyyy')}
                </div>
                <div className="flex gap-px flex-wrap" style={{ width: yearSpan > 3 ? '80px' : '120px' }}>
                  {daysInMonth.map((day, j) => {
                    const isDayToday = isToday(day)
                    return (
                      <div
                        key={j}
                        ref={isDayToday ? todayRef : null}
                        title={getDateTooltip(day)}
                        onClick={() => setSelectedDate(day)}
                        className={`rounded-sm cursor-pointer transition-all hover:scale-150 hover:z-10 ${getDateColor(day)} ${
                          isDayToday ? 'ring-2 ring-primary-light ring-offset-1 ring-offset-surface' : ''
                        } ${selectedDate && isSameDay(day, selectedDate) ? 'ring-2 ring-accent' : ''}`}
                        style={{
                          width: yearSpan > 3 ? '6px' : '10px',
                          height: yearSpan > 3 ? '6px' : '10px',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-success" /> 80%+ done
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-warning" /> 50%+ done
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-warning/50" /> Some done
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-surface-lighter/30" /> No data
        </div>
      </div>
    </div>
  )
}
