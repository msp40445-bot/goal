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
  const systemPrompt = `You are GoalForge AI — an elite personal productivity coach and life optimizer. You are direct, sharp, and action-oriented. You help the user crush their goals, stay disciplined, and become the best version of themselves.

Current context:
${context}

Your approach:
- Be DIRECT and ACTIONABLE — no fluff, give specific steps
- Break goals into small executable daily actions
- Track patterns: identify weak areas and strengths
- Give honest feedback — praise wins, call out slacking
- Suggest time-blocked schedules when asked
- Respect Islamic values and prayer times
- Follow the 1% daily improvement (kaizen) philosophy
- Use bullet points and structured formats
- When breaking down tasks, number each step clearly
- Always end with ONE key action the user should do RIGHT NOW`

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
    `[${t.completed ? 'DONE' : 'TODO'}] ${t.title} (${t.category}, ${t.priority})`
  ).join('\n')

  const prompts = {
    daily: `Analyze my goals and tasks. Create a SHARP prioritized plan for today:
1. Top 3 tasks to focus on (with time estimates)
2. Which goal needs the most attention right now
3. One specific action step for my weakest area
Be concise and actionable.`,
    checkin: `Do a progress check-in:
1. Rate my overall execution (1-10) based on completed vs pending tasks
2. Which areas am I strong in? Which am I neglecting?
3. Give 2-3 specific improvements I should make THIS WEEK
4. A motivational insight based on my progress
Be honest and direct.`,
    breakdown: `Look at my goals and break down the MOST IMPORTANT uncompleted goal into:
1. 5-7 specific daily/weekly actions I can start TODAY
2. Each action should be completable in 30-60 minutes
3. Order them by priority and dependency
4. Include estimated completion dates
Make each step crystal clear and executable.`,
    weakness: `Analyze my task completion patterns and goals:
1. Which categories am I neglecting most?
2. What patterns do you see in my incomplete tasks?
3. Give 3 specific strategies to improve my weakest area
4. Suggest habit changes that would make the biggest impact
Be brutally honest but constructive.`,
    weekly: `Generate a weekly review:
1. Summary of what was accomplished
2. Completion rate analysis by category
3. Top 3 wins to celebrate
4. Top 3 areas needing improvement
5. Specific plan for next week
6. Overall momentum assessment (accelerating/maintaining/declining)`
  }

  const prompt = prompts[type] || prompts.daily

  return chatWithAI(
    [{ role: 'user', content: prompt }],
    `Goals:\n${goalSummary}\n\nTasks:\n${taskSummary}`
  )
}

export async function getTaskBreakdown(goalTitle, goalDescription, existingMilestones) {
  const milestoneStr = existingMilestones.map(m =>
    `- ${m.title} (${m.completed ? 'DONE' : 'pending'})`
  ).join('\n')

  const prompt = `Break down this goal into specific, executable steps:

Goal: ${goalTitle}
Description: ${goalDescription}
${milestoneStr ? `\nExisting milestones:\n${milestoneStr}` : ''}

Create 5-8 NEW specific action steps that:
1. Are each completable in 1-3 hours
2. Build on each other logically
3. Don't duplicate existing milestones
4. Are measurable (you know when it's done)

Format each as a simple title (no numbering, no descriptions). One per line.`

  const response = await chatWithAI([{ role: 'user', content: prompt }], '')
  return response
}

export async function analyzeActivityLog(logs, goals) {
  const logSummary = logs.slice(-20).map(l =>
    `[${l.timestamp}] ${l.category}: ${l.content}`
  ).join('\n')

  const goalSummary = goals.map(g =>
    `${g.title} (${g.category}): ${g.progress}%`
  ).join('\n')

  const prompt = `Analyze my recent activity log and goals:

Activity Log (recent):
${logSummary}

Goals:
${goalSummary}

Provide:
1. Time allocation analysis — am I spending time on the right things?
2. Pattern insights — when am I most productive?
3. Alignment check — does my activity match my goals?
4. 3 specific optimization suggestions
Be data-driven and specific.`

  return chatWithAI([{ role: 'user', content: prompt }], '')
}
