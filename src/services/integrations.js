// --- Discord Webhook Integration ---

export function getDiscordConfig() {
  try {
    const data = localStorage.getItem('goalforge-discord-config')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setDiscordConfig(config) {
  localStorage.setItem('goalforge-discord-config', JSON.stringify(config))
}

export function removeDiscordConfig() {
  localStorage.removeItem('goalforge-discord-config')
}

export async function sendDiscordMessage(content, options = {}) {
  const config = getDiscordConfig()
  if (!config?.webhookUrl) throw new Error('Discord webhook not configured')

  const payload = {
    username: options.username || 'GoalForge',
    avatar_url: options.avatarUrl || '',
    embeds: options.embeds || undefined,
    content: options.embeds ? undefined : content
  }

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(`Discord webhook failed: ${response.status}`)
  return true
}

export async function sendDiscordGoalUpdate(goal, action) {
  const colors = { tech: 0x3b82f6, study: 0xf59e0b, islam: 0x10b981, growth: 0xec4899 }

  return sendDiscordMessage('', {
    embeds: [{
      title: `Goal ${action}: ${goal.title}`,
      description: goal.description || '',
      color: colors[goal.category] || 0x6366f1,
      fields: [
        { name: 'Category', value: goal.category, inline: true },
        { name: 'Progress', value: `${goal.progress}%`, inline: true },
        { name: 'Milestones', value: `${goal.milestones?.filter(m => m.completed).length || 0}/${goal.milestones?.length || 0}`, inline: true }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'GoalForge' }
    }]
  })
}

export async function sendDiscordDailySummary(tasks, goals, streak) {
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  return sendDiscordMessage('', {
    embeds: [{
      title: 'Daily Summary',
      color: rate >= 80 ? 0x22c55e : rate >= 50 ? 0xf59e0b : 0xef4444,
      fields: [
        { name: 'Tasks Completed', value: `${completed}/${total} (${rate}%)`, inline: true },
        { name: 'Streak', value: `${streak} days`, inline: true },
        { name: 'Active Goals', value: `${goals.length}`, inline: true }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'GoalForge Daily Report' }
    }]
  })
}

export async function testDiscordWebhook(webhookUrl) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'GoalForge',
      embeds: [{
        title: 'Connection Successful',
        description: 'GoalForge is now connected to this Discord channel.',
        color: 0x22c55e,
        timestamp: new Date().toISOString()
      }]
    })
  })

  if (!response.ok) throw new Error('Webhook test failed')
  return true
}

// --- Telegram Bot Integration ---

export function getTelegramConfig() {
  try {
    const data = localStorage.getItem('goalforge-telegram-config')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setTelegramConfig(config) {
  localStorage.setItem('goalforge-telegram-config', JSON.stringify(config))
}

export function removeTelegramConfig() {
  localStorage.removeItem('goalforge-telegram-config')
}

export async function sendTelegramMessage(text, options = {}) {
  const config = getTelegramConfig()
  if (!config?.botToken || !config?.chatId) throw new Error('Telegram bot not configured')

  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.chatId,
      text,
      parse_mode: options.parseMode || 'HTML',
      disable_notification: options.silent || false
    })
  })

  if (!response.ok) throw new Error(`Telegram API failed: ${response.status}`)
  return response.json()
}

export async function sendTelegramDailySummary(tasks, goals, streak) {
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  const message = `<b>GoalForge Daily Summary</b>

<b>Tasks:</b> ${completed}/${total} (${rate}%)
<b>Streak:</b> ${streak} days
<b>Active Goals:</b> ${goals.length}

${rate >= 80 ? 'Great job today!' : rate >= 50 ? 'Good effort, keep pushing!' : 'Tomorrow is a new opportunity!'}`

  return sendTelegramMessage(message)
}

export async function testTelegramBot(botToken, chatId) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '<b>GoalForge Connected!</b>\nYou will now receive updates from GoalForge.',
      parse_mode: 'HTML'
    })
  })

  if (!response.ok) throw new Error('Telegram test failed')
  return true
}
