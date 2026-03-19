import { useState } from 'react'
import { FileText, Plus, Tag, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { categoryConfig } from '../data/defaultGoals'

export default function ActivityLog({ logs, onAddLog }) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('growth')
  const [expanded, setExpanded] = useState(true)

  const handleAdd = () => {
    if (!content.trim()) return
    onAddLog({
      id: `log-${Date.now()}`,
      content: content.trim(),
      category,
      timestamp: new Date().toISOString(),
    })
    setContent('')
  }

  const todayLogs = logs.filter(l => {
    const logDate = format(new Date(l.timestamp), 'yyyy-MM-dd')
    const today = format(new Date(), 'yyyy-MM-dd')
    return logDate === today
  })

  const olderLogs = logs.filter(l => {
    const logDate = format(new Date(l.timestamp), 'yyyy-MM-dd')
    const today = format(new Date(), 'yyyy-MM-dd')
    return logDate !== today
  }).slice(-10).reverse()

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent-light" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Activity Log</span>
          <span className="text-xs text-text-muted">({todayLogs.length} today)</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-surface-light rounded transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3 text-text-muted" /> : <ChevronDown className="w-3 h-3 text-text-muted" />}
        </button>
      </div>

      {expanded && (
        <>
          <div className="flex gap-1.5 mb-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Log what you did..."
              className="input-sharp flex-1 text-xs"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-sharp text-xs w-24"
            >
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="p-2 rounded-lg bg-accent/20 text-accent-light hover:bg-accent/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {todayLogs.length === 0 && olderLogs.length === 0 && (
              <p className="text-xs text-text-muted text-center py-3">No activity logged yet. Start logging!</p>
            )}

            {todayLogs.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-text-muted font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Today
                </div>
                {todayLogs.map((log) => {
                  const config = categoryConfig[log.category] || { color: '#6366f1' }
                  return (
                    <div key={log.id} className="flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-light/50 group animate-slide-up">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: config.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary leading-relaxed">{log.content}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted">{format(new Date(log.timestamp), 'h:mm a')}</span>
                          <Tag className="w-2.5 h-2.5 text-text-muted" />
                          <span className="text-xs text-text-muted">{categoryConfig[log.category]?.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {olderLogs.length > 0 && (
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">Recent</div>
                {olderLogs.map((log) => {
                  const config = categoryConfig[log.category] || { color: '#6366f1' }
                  return (
                    <div key={log.id} className="flex items-start gap-2 py-1 px-2 rounded-lg hover:bg-surface-light/50 opacity-70">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: config.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-secondary">{log.content}</p>
                        <span className="text-xs text-text-muted">{format(new Date(log.timestamp), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
