import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { chatWithAI, checkOllamaStatus, getAISuggestion } from '../services/ai'
import { categoryConfig } from '../data/defaultGoals'

export default function AIChat({ goals, tasks }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Assalamu Alaikum! I\'m your GoalForge AI assistant. I can help you plan your day, suggest improvements, check in on your progress, and give you ideas for your goals. How can I help you today?'
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
        content: 'Sorry, I encountered an error. Make sure Ollama is running with Qwen 2.5.'
      }])
    }

    setLoading(false)
  }

  const quickAction = async (type) => {
    setLoading(true)
    const prompt = type === 'daily'
      ? 'What should I focus on today? Give me a prioritized plan.'
      : type === 'checkin'
      ? 'Do a check-in on my progress. How am I doing? What should I adjust?'
      : 'Give me 3 creative ideas for advancing my goals this week.'

    setMessages(prev => [...prev, { role: 'user', content: prompt }])

    try {
      const response = await getAISuggestion(goals, tasks, type === 'daily' ? 'daily' : 'checkin')
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI is offline. Please check Ollama is running.'
      }])
    }

    setLoading(false)
  }

  return (
    <div className="bg-surface rounded-xl flex flex-col h-full">
      <div className="p-4 border-b border-surface-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-light" />
            <h2 className="text-lg font-semibold text-text-primary">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${aiStatus.connected ? 'bg-success' : 'bg-danger'}`} />
            <span className="text-xs text-text-secondary">
              {aiStatus.connected ? (aiStatus.hasModel ? 'Qwen 2.5 Ready' : 'Ollama Connected') : 'Offline'}
            </span>
            <button
              onClick={() => checkOllamaStatus().then(setAiStatus)}
              className="p-1 hover:bg-surface-light rounded"
            >
              <RefreshCw className="w-3 h-3 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => quickAction('daily')}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" /> Daily Plan
          </button>
          <button
            onClick={() => quickAction('checkin')}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-success/20 hover:bg-success/30 text-success rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" /> Check-in
          </button>
          <button
            onClick={() => quickAction('ideas')}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" /> Ideas
          </button>
        </div>
      </div>

      {!aiStatus.connected && (
        <div className="px-4 py-3 bg-warning/10 border-b border-warning/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
            <div className="text-xs text-warning">
              <p className="font-medium">AI is offline</p>
              <p className="mt-1">Install Ollama and run: <code className="bg-surface-light px-1 py-0.5 rounded">ollama run qwen2.5:7b</code></p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-48 max-h-96">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-light" />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-surface-light text-text-primary'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-accent" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-light animate-pulse" />
            </div>
            <div className="bg-surface-light px-3 py-2 rounded-xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-surface-light">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your goals, get suggestions..."
            className="flex-1 px-3 py-2 bg-surface-light rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-surface-lighter focus:border-primary focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
