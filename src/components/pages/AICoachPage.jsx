import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw, Zap, Target, TrendingDown, BarChart3, Calendar, Brain, ListChecks } from 'lucide-react'
import { chatWithAI, checkOllamaStatus, getAISuggestion } from '../../services/ai'
import { categoryConfig } from '../../data/defaultGoals'
import { getWhoopSummary, isWhoopConnected } from '../../services/whoop'

export default function AICoachPage({ goals, tasks }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Assalamu Alaikum! I\'m your GoalForge AI Coach — an agentic productivity system. I can:\n\n- Create smart daily/weekly plans based on your goals & health data\n- Break down any goal into actionable steps\n- Analyze your patterns and weaknesses\n- Build time-blocked schedules around your recovery & energy\n- Generate weekly reviews\n\nWhat would you like to work on?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState({ connected: false, hasModel: false })
  const [whoopAvailable, setWhoopAvailable] = useState(false)
  const messagesEndRef = useRef(null)

  const [whoopChecked] = useState(() => isWhoopConnected())

  useEffect(() => {
    checkOllamaStatus().then(setAiStatus)
  }, [])

  useEffect(() => {
    setWhoopAvailable(whoopChecked)
  }, [whoopChecked])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getContext = async () => {
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

    let whoopContext = ''
    if (whoopAvailable) {
      try {
        const whoopData = await getWhoopSummary()
        if (whoopData.connected) {
          whoopContext = '\n\nWhoop Health Data:'
          if (whoopData.recovery) {
            whoopContext += `\n- Recovery Score: ${whoopData.recovery.score}%`
            whoopContext += `\n- HRV: ${whoopData.recovery.hrv?.toFixed(1)}ms`
            whoopContext += `\n- Resting HR: ${whoopData.recovery.restingHR} bpm`
          }
          if (whoopData.sleep) {
            whoopContext += `\n- Sleep Performance: ${whoopData.sleep.performance}%`
            whoopContext += `\n- Sleep Duration: ${whoopData.sleep.duration ? Math.round(whoopData.sleep.duration / 3600000) + 'h' : 'N/A'}`
          }
          if (whoopData.workouts.length > 0) {
            whoopContext += `\n- Recent Workouts: ${whoopData.workouts.map(w => `${w.sport}(${w.duration}min)`).join(', ')}`
          }
        }
      } catch {
        // Whoop data not available
      }
    }

    return `Goals:\n${goalSummary}\n\nToday's Tasks (${completedToday}/${totalTasks} done):\n${taskSummary}${whoopContext}`
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const context = await getContext()
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
      daily: 'Create my optimized daily plan with priorities and time blocks',
      checkin: 'Check in on my progress — be honest and direct',
      breakdown: 'Break down my most important uncompleted goal into executable steps',
      weakness: 'Analyze my weak areas and create an improvement strategy',
      weekly: 'Generate a comprehensive weekly review with next steps',
      schedule: 'Create a time-blocked schedule for today based on my recovery and energy',
      sprint: 'Create a 7-day sprint plan to maximize progress on my goals'
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
    { type: 'daily', label: 'Daily Plan', icon: Zap, desc: 'AI-optimized priorities' },
    { type: 'schedule', label: 'Time Block', icon: Calendar, desc: 'Schedule your day' },
    { type: 'checkin', label: 'Check-in', icon: Sparkles, desc: 'Progress review' },
    { type: 'breakdown', label: 'Breakdown', icon: Target, desc: 'Split goals into steps' },
    { type: 'weakness', label: 'Weakness', icon: TrendingDown, desc: 'Find blind spots' },
    { type: 'weekly', label: 'Weekly Review', icon: BarChart3, desc: 'Full weekly analysis' },
    { type: 'sprint', label: '7-Day Sprint', icon: ListChecks, desc: 'Week-long plan' },
  ]

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">AI Coach</h2>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${aiStatus.connected ? 'bg-success pulse-dot' : 'bg-danger'}`} />
              <span className="text-xs text-text-muted">
                {aiStatus.connected ? (aiStatus.hasModel ? 'Qwen 2.5 Ready' : 'Ollama Connected') : 'Offline — run: ollama run qwen2.5:7b'}
              </span>
              {whoopAvailable && (
                <span className="text-xs text-success flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-success" /> Whoop
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => checkOllamaStatus().then(setAiStatus)}
          className="p-2 hover:bg-surface-light rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.type}
              onClick={() => quickAction(action.type)}
              disabled={loading}
              className="card p-3 text-left hover:border-primary/30 transition-all disabled:opacity-40 group"
            >
              <Icon className="w-4 h-4 text-primary-light mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-text-primary">{action.label}</div>
              <div className="text-[10px] text-text-muted leading-tight mt-0.5">{action.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Offline warning */}
      {!aiStatus.connected && (
        <div className="px-4 py-3 bg-warning/5 border border-warning/20 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <div>
              <span className="text-xs text-warning font-medium">AI is offline</span>
              <span className="text-xs text-text-muted ml-2">
                Run: <code className="bg-surface-light px-1.5 py-0.5 rounded text-xs font-mono">ollama run qwen2.5:7b</code>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 card flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''} animate-slide-up`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary-light" />
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-surface-light text-text-primary border border-surface-border'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-accent-light" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-light animate-pulse" />
              </div>
              <div className="bg-surface-light border border-surface-border px-4 py-3 rounded-2xl">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-surface-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything — plans, breakdowns, analysis, schedule optimization..."
              className="input-sharp flex-1"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-40 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
