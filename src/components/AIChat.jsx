import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw, Zap, Target, TrendingDown, BarChart3 } from 'lucide-react'
import { chatWithAI, checkOllamaStatus, getAISuggestion } from '../services/ai'
import { categoryConfig } from '../data/defaultGoals'

export default function AIChat({ goals, tasks }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Assalamu Alaikum! I\'m your GoalForge AI — your personal productivity coach. I can create daily plans, break down goals, analyze your weaknesses, and help you execute. What do you need?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState({ connected: false, hasModel: false })
  const messagesEndRef = useRef(null)

  useEffect(() => {
    checkOllamaStatus().then(setAiStatus)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getContext = () => {
    const goalSummary = goals.map(g => {
      const config = categoryConfig[g.category] || {}
      return `- ${g.title} [${config.label}]: ${g.progress}% complete. Milestones: ${g.milestones.map(m => `${m.title}(${m.completed ? 'done' : 'pending'})`).join(', ')}`
    }).join('\n')

    const taskSummary = tasks.map(t => {
      const config = categoryConfig[t.category] || {}
      return `- [${t.completed ? 'DONE' : 'TODO'}] ${t.title} (${config.label}, ${t.priority} priority)`
    }).join('\n')

    const completedToday = tasks.filter(t => t.completed).length
    const totalTasks = tasks.length

    return `Goals:\n${goalSummary}\n\nToday's Tasks (${completedToday}/${totalTasks} done):\n${taskSummary}`
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const context = getContext()
      const apiMessages = messages
        .filter(m => m.role !== 'system')
        .concat(userMessage)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await chatWithAI(apiMessages, context)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI is offline. Make sure Ollama is running with Qwen 2.5.'
      }])
    }

    setLoading(false)
  }

  const quickAction = async (type) => {
    setLoading(true)
    const labels = {
      daily: 'Create my daily plan with priorities',
      checkin: 'Check in on my progress and give feedback',
      breakdown: 'Break down my most important goal into steps',
      weakness: 'Analyze my weak areas and suggest improvements',
      weekly: 'Generate my weekly review'
    }

    setMessages(prev => [...prev, { role: 'user', content: labels[type] || labels.daily }])

    try {
      const response = await getAISuggestion(goals, tasks, type)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI is offline. Please check Ollama is running.'
      }])
    }

    setLoading(false)
  }

  const quickActions = [
    { type: 'daily', label: 'Daily Plan', icon: Zap, className: 'bg-primary/15 text-primary-light hover:bg-primary/25' },
    { type: 'checkin', label: 'Check-in', icon: Sparkles, className: 'bg-success/15 text-success hover:bg-success/25' },
    { type: 'breakdown', label: 'Breakdown', icon: Target, className: 'bg-accent/15 text-accent-light hover:bg-accent/25' },
    { type: 'weakness', label: 'Weakness', icon: TrendingDown, className: 'bg-warning/15 text-warning hover:bg-warning/25' },
    { type: 'weekly', label: 'Review', icon: BarChart3, className: 'bg-cyan/15 text-cyan hover:bg-cyan/25' },
  ]

  return (
    <div className="card flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-surface-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary-light" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">AI Coach</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${aiStatus.connected ? 'bg-success pulse-dot' : 'bg-danger'}`} />
            <span className="text-xs text-text-muted">
              {aiStatus.connected ? (aiStatus.hasModel ? 'Qwen 2.5' : 'Ollama') : 'Offline'}
            </span>
            <button
              onClick={() => checkOllamaStatus().then(setAiStatus)}
              className="p-0.5 hover:bg-surface-light rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Quick action pills */}
        <div className="flex gap-1 flex-wrap">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.type}
                onClick={() => quickAction(action.type)}
                disabled={loading}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${action.className}`}
              >
                <Icon className="w-3 h-3" /> {action.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Offline warning */}
      {!aiStatus.connected && (
        <div className="px-3 py-2 bg-warning/5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-warning" />
            <span className="text-xs text-warning">
              Run: <code className="bg-surface-light px-1 py-0.5 rounded text-xs">ollama run qwen2.5:7b</code>
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-32 max-h-80">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''} animate-slide-up`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary-light" />
              </div>
            )}
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-surface-light text-text-primary border border-surface-border'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-accent-light" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary-light animate-pulse" />
            </div>
            <div className="bg-surface-light border border-surface-border px-3 py-2 rounded-xl">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-surface-border">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything — plans, tips, analysis..."
            className="input-sharp flex-1 text-xs"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-primary-light transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
