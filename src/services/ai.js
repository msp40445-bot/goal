const OLLAMA_BASE_URL = 'http://localhost:11434'
const MODEL = 'qwen2.5:7b'

export async function checkOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    if (response.ok) {
      const data = await response.json()
      const hasModel = data.models?.some(m => m.name.startsWith('qwen2.5'))
      return { connected: true, hasModel, models: data.models || [] }
    }
    return { connected: false, hasModel: false, models: [] }
  } catch {
    return { connected: false, hasModel: false, models: [] }
  }
}

export async function chatWithAI(messages, context = '') {
  const systemPrompt = `You are GoalForge AI, a personal productivity and life coach assistant. You help the user stay on track with their goals, suggest improvements, check in on progress, and provide actionable advice.

Current context about the user's goals and tasks:
${context}

Guidelines:
- Be encouraging but honest
- Give specific, actionable suggestions
- Help break down large goals into manageable steps
- Remind about daily habits and routines
- Be respectful of Islamic values and practices
- Focus on the 10% daily improvement philosophy
- Keep responses concise and practical`

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get AI response')
    }

    const data = await response.json()
    return data.message?.content || 'No response from AI.'
  } catch (error) {
    return `AI is offline. Make sure Ollama is running with ${MODEL}. Error: ${error.message}`
  }
}

export async function getAISuggestion(goals, tasks, type = 'daily') {
  const goalSummary = goals.map(g =>
    `${g.title} (${g.category}): ${g.progress}% complete - ${g.description}`
  ).join('\n')

  const taskSummary = tasks.map(t =>
    `[${t.completed ? 'DONE' : 'TODO'}] ${t.title} (${t.category})`
  ).join('\n')

  const prompt = type === 'daily'
    ? `Based on these goals and tasks, suggest 3 things I should focus on today to make the most progress. Be specific and actionable.`
    : `Review my overall progress and give me a brief motivational check-in with 2-3 suggestions for improvement.`

  return chatWithAI(
    [{ role: 'user', content: prompt }],
    `Goals:\n${goalSummary}\n\nTasks:\n${taskSummary}`
  )
}
