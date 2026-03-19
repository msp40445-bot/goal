import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Target, ListTodo, Bot, Timer, FileText, X } from 'lucide-react'

const COMMANDS = [
  { id: 'add-task', label: 'Add new task', icon: Plus, section: 'Actions' },
  { id: 'add-goal', label: 'Add new goal', icon: Target, section: 'Actions' },
  { id: 'add-log', label: 'Log activity', icon: FileText, section: 'Actions' },
  { id: 'ai-plan', label: 'AI: Create daily plan', icon: Bot, section: 'AI' },
  { id: 'ai-checkin', label: 'AI: Progress check-in', icon: Bot, section: 'AI' },
  { id: 'ai-breakdown', label: 'AI: Break down goals', icon: Bot, section: 'AI' },
  { id: 'ai-weakness', label: 'AI: Analyze weaknesses', icon: Bot, section: 'AI' },
  { id: 'ai-weekly', label: 'AI: Weekly review', icon: Bot, section: 'AI' },
  { id: 'focus-timer', label: 'Start focus timer', icon: Timer, section: 'Tools' },
  { id: 'view-tasks', label: 'View all tasks', icon: ListTodo, section: 'Navigate' },
  { id: 'view-goals', label: 'View all goals', icon: Target, section: 'Navigate' },
]

export default function CommandBar({ open, onClose, onCommand, goals, tasks }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
        else onCommand('open-command-bar')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, onCommand])

  if (!open) return null

  const goalItems = goals.map(g => ({
    id: `goto-goal-${g.id}`,
    label: g.title,
    icon: Target,
    section: 'Goals'
  }))

  const taskItems = tasks.filter(t => !t.completed).slice(0, 5).map(t => ({
    id: `goto-task-${t.id}`,
    label: t.title,
    icon: ListTodo,
    section: 'Tasks'
  }))

  const allItems = [...COMMANDS, ...goalItems, ...taskItems]

  const filtered = query.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allItems

  const sections = filtered.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  const flatFiltered = filtered
  const maxIndex = flatFiltered.length - 1

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, maxIndex))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && flatFiltered[selectedIndex]) {
      onCommand(flatFiltered[selectedIndex].id)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  let itemIndex = -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, goals, tasks..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-xs text-text-muted border border-surface-border">esc</kbd>
          <button onClick={onClose} className="p-1 hover:bg-surface-light rounded transition-colors">
            <X className="w-3.5 h-3.5 text-text-muted" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <div className="px-4 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">{section}</div>
              {items.map((item) => {
                itemIndex++
                const currentIndex = itemIndex
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => { onCommand(item.id); onClose() }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                      selectedIndex === currentIndex
                        ? 'bg-primary/10 text-primary-light'
                        : 'text-text-secondary hover:bg-surface-light'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}

          {flatFiltered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              No results for &quot;{query}&quot;
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-surface-border flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-surface-light rounded border border-surface-border">&#8593;&#8595;</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-surface-light rounded border border-surface-border">&#8629;</kbd> select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-surface-light rounded border border-surface-border">&#8984;K</kbd> toggle
          </span>
        </div>
      </div>
    </div>
  )
}
