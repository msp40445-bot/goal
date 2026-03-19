import { useState, useRef, useEffect } from 'react'
import { format, startOfYear, endOfYear, eachMonthOfInterval, differenceInDays, addYears, isToday, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'

export default function Timeline({ completionLog }) {
  const [yearSpan, setYearSpan] = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [expanded, setExpanded] = useState(true)
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
      if (date < now && !isToday(date)) return 'bg-surface-lighter/20'
      return 'bg-surface-lighter/40'
    }
    const rate = log.completed / log.total
    if (rate >= 0.8) return 'bg-success'
    if (rate >= 0.5) return 'bg-warning'
    if (rate > 0) return 'bg-warning/40'
    return 'bg-danger/40'
  }

  const getDateTooltip = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = completionLog[dateStr]
    if (!log) return format(date, 'MMM d, yyyy')
    return `${format(date, 'MMM d, yyyy')}: ${log.completed}/${log.total} tasks`
  }

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  const selectedLog = selectedDateStr ? completionLog[selectedDateStr] : null

  return (
    <div className="card p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-light" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Year Timeline</span>
          <span className="text-xs text-text-muted stat-number">
            Day {daysSoFar}/{totalDays}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 3, 5].map(span => (
            <button
              key={span}
              onClick={() => setYearSpan(span)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                yearSpan === span
                  ? 'bg-primary/20 text-primary-light'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {span}Y
            </button>
          ))}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-surface-light rounded transition-colors ml-1"
          >
            {expanded ? <ChevronUp className="w-3 h-3 text-text-muted" /> : <ChevronDown className="w-3 h-3 text-text-muted" />}
          </button>
        </div>
      </div>

      {/* Year progress bar */}
      <div className="h-1.5 bg-surface-lighter rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)'
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-text-muted mb-2">
        <span>{format(start, 'MMM yyyy')}</span>
        <span className="text-primary-light font-medium">{progressPercent}% of year</span>
        <span>{format(end, 'MMM yyyy')}</span>
      </div>

      {expanded && (
        <div className="animate-slide-up">
          <div ref={scrollRef} className="overflow-x-auto pb-1">
            <div className="flex gap-0.5" style={{ minWidth: `${months.length * (yearSpan > 3 ? 70 : 100)}px` }}>
              {months.map((month, i) => {
                const daysInMonth = eachDayOfInterval({
                  start: startOfMonth(month),
                  end: endOfMonth(month)
                })
                const isCurrentMonth = isSameMonth(month, now)

                return (
                  <div key={i} className="flex-shrink-0">
                    <div className={`text-xs font-medium mb-0.5 px-0.5 ${
                      isCurrentMonth ? 'text-primary-light' : 'text-text-muted'
                    }`}>
                      {format(month, yearSpan > 3 ? 'MMM' : 'MMM yy')}
                    </div>
                    <div className="flex gap-px flex-wrap" style={{ width: yearSpan > 3 ? '65px' : '100px' }}>
                      {daysInMonth.map((day, j) => {
                        const isDayToday = isToday(day)
                        const cellSize = yearSpan > 3 ? 5 : yearSpan > 1 ? 7 : 9
                        return (
                          <div
                            key={j}
                            ref={isDayToday ? todayRef : null}
                            title={getDateTooltip(day)}
                            onClick={() => setSelectedDate(day)}
                            className={`rounded-sm cursor-pointer transition-all hover:scale-150 hover:z-10 ${getDateColor(day)} ${
                              isDayToday ? 'ring-1 ring-primary-light' : ''
                            } ${selectedDate && isSameDay(day, selectedDate) ? 'ring-1 ring-accent' : ''}`}
                            style={{
                              width: `${cellSize}px`,
                              height: `${cellSize}px`,
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

          {/* Legend + selected date info */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-sm bg-success" /> 80%+
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-sm bg-warning" /> 50%+
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-sm bg-warning/40" /> some
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-sm bg-surface-lighter/30" /> none
              </div>
            </div>
            {selectedDate && (
              <div className="text-xs text-text-secondary animate-fade-in">
                {format(selectedDate, 'MMM d, yyyy')}
                {selectedLog && (
                  <span className="text-text-muted"> - {selectedLog.completed}/{selectedLog.total} tasks</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
