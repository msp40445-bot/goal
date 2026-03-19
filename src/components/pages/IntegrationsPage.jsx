import { useState } from 'react'
import { Link2, ExternalLink, Check, X, AlertCircle, Trash2, TestTube } from 'lucide-react'
import {
  getDiscordConfig, setDiscordConfig, removeDiscordConfig, testDiscordWebhook,
  getTelegramConfig, setTelegramConfig, removeTelegramConfig, testTelegramBot
} from '../../services/integrations'
import {
  isWhoopConnected, getWhoopConfig, setWhoopConfig, getAuthUrl, disconnectWhoop
} from '../../services/whoop'

function IntegrationCard({ name, icon, description, connected, children, onDisconnect }) {
  const [expanded, setExpanded] = useState(!connected)

  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-light border border-surface-border flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{name}</div>
            <div className="text-xs text-text-muted">{description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1 text-xs text-success font-medium px-2 py-1 bg-success/10 rounded-full">
              <Check className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="text-xs text-text-muted px-2 py-1 bg-surface-light rounded-full">Not connected</span>
          )}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-border pt-3 animate-slide-up">
          {children}
          {connected && onDisconnect && (
            <button
              onClick={onDisconnect}
              className="mt-3 flex items-center gap-1.5 text-xs text-danger/70 hover:text-danger transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Disconnect
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function DiscordSetup() {
  const [config, setConfig] = useState(getDiscordConfig())
  const [webhookUrl, setWebhookUrl] = useState(config?.webhookUrl || '')
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState('')

  const handleSave = () => {
    if (!webhookUrl.trim()) return
    const newConfig = { webhookUrl: webhookUrl.trim(), enabled: true }
    setDiscordConfig(newConfig)
    setConfig(newConfig)
    setStatus('Saved!')
    setTimeout(() => setStatus(''), 2000)
  }

  const handleTest = async () => {
    setTesting(true)
    setStatus('')
    try {
      await testDiscordWebhook(webhookUrl.trim())
      setStatus('Test message sent!')
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
    setTesting(false)
  }

  const handleDisconnect = () => {
    removeDiscordConfig()
    setConfig(null)
    setWebhookUrl('')
  }

  return (
    <IntegrationCard
      name="Discord"
      icon="🎮"
      description="Send goal updates and daily summaries to Discord"
      connected={!!config?.enabled}
      onDisconnect={handleDisconnect}
    >
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-secondary">Webhook URL</label>
        <input
          type="text"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className="input-sharp w-full text-xs"
        />
        <p className="text-[10px] text-text-muted">
          Go to your Discord channel → Settings → Integrations → Webhooks → New Webhook → Copy URL
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={!webhookUrl.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Save
          </button>
          <button
            onClick={handleTest}
            disabled={!webhookUrl.trim() || testing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-light text-text-secondary border border-surface-border hover:bg-surface-lighter transition-colors disabled:opacity-40"
          >
            <TestTube className="w-3 h-3" /> {testing ? 'Testing...' : 'Test'}
          </button>
          {status && (
            <span className={`text-xs ${status.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{status}</span>
          )}
        </div>
      </div>
    </IntegrationCard>
  )
}

function TelegramSetup() {
  const [config, setConfig] = useState(getTelegramConfig())
  const [botToken, setBotToken] = useState(config?.botToken || '')
  const [chatId, setChatId] = useState(config?.chatId || '')
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState('')

  const handleSave = () => {
    if (!botToken.trim() || !chatId.trim()) return
    const newConfig = { botToken: botToken.trim(), chatId: chatId.trim(), enabled: true }
    setTelegramConfig(newConfig)
    setConfig(newConfig)
    setStatus('Saved!')
    setTimeout(() => setStatus(''), 2000)
  }

  const handleTest = async () => {
    setTesting(true)
    setStatus('')
    try {
      await testTelegramBot(botToken.trim(), chatId.trim())
      setStatus('Test message sent!')
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
    setTesting(false)
  }

  const handleDisconnect = () => {
    removeTelegramConfig()
    setConfig(null)
    setBotToken('')
    setChatId('')
  }

  return (
    <IntegrationCard
      name="Telegram"
      icon="✈️"
      description="Receive notifications and summaries via Telegram bot"
      connected={!!config?.enabled}
      onDisconnect={handleDisconnect}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Bot Token</label>
          <input
            type="password"
            value={botToken}
            onChange={e => setBotToken(e.target.value)}
            placeholder="123456:ABC-DEF1234..."
            className="input-sharp w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Chat ID</label>
          <input
            type="text"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            placeholder="Your chat/group ID"
            className="input-sharp w-full text-xs"
          />
        </div>
        <p className="text-[10px] text-text-muted">
          1. Create a bot via @BotFather on Telegram. 2. Get your chat ID by messaging @userinfobot.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={!botToken.trim() || !chatId.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Save
          </button>
          <button
            onClick={handleTest}
            disabled={!botToken.trim() || !chatId.trim() || testing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-light text-text-secondary border border-surface-border hover:bg-surface-lighter transition-colors disabled:opacity-40"
          >
            <TestTube className="w-3 h-3" /> {testing ? 'Testing...' : 'Test'}
          </button>
          {status && (
            <span className={`text-xs ${status.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{status}</span>
          )}
        </div>
      </div>
    </IntegrationCard>
  )
}

function WhoopSetup() {
  const [connected, setConnected] = useState(isWhoopConnected())
  const [config, setConfig] = useState(getWhoopConfig())
  const [clientId, setClientId] = useState(config?.clientId || '')
  const [clientSecret, setClientSecret] = useState(config?.clientSecret || '')
  const [redirectUri, setRedirectUri] = useState(config?.redirectUri || window.location.origin + '/whoop/callback')
  const [status, setStatus] = useState('')

  const handleSave = () => {
    if (!clientId.trim() || !clientSecret.trim()) return
    const newConfig = { clientId: clientId.trim(), clientSecret: clientSecret.trim(), redirectUri: redirectUri.trim() }
    setWhoopConfig(newConfig)
    setConfig(newConfig)
    setStatus('Config saved!')
    setTimeout(() => setStatus(''), 2000)
  }

  const handleConnect = () => {
    if (!config?.clientId) {
      setStatus('Save your config first')
      return
    }
    const authUrl = getAuthUrl(config.clientId, config.redirectUri || redirectUri)
    window.open(authUrl, '_blank', 'width=500,height=700')
  }

  const handleDisconnect = () => {
    disconnectWhoop()
    setConnected(false)
  }

  return (
    <IntegrationCard
      name="WHOOP"
      icon="⌚"
      description="Sync recovery, sleep, strain & workout data for AI-powered scheduling"
      connected={connected}
      onDisconnect={handleDisconnect}
    >
      <div className="space-y-2">
        <div className="p-3 bg-surface-light border border-surface-border rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
            <div className="text-xs text-text-secondary leading-relaxed">
              <strong>Setup:</strong> Create an app at{' '}
              <a href="https://developer.whoop.com" target="_blank" rel="noopener noreferrer" className="text-primary-light hover:underline">
                developer.whoop.com <ExternalLink className="w-3 h-3 inline" />
              </a>
              {' '}to get your Client ID and Secret. Set the redirect URI to your app&apos;s URL.
              The AI will use your recovery/sleep data to optimize your daily schedule.
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Client ID</label>
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="Your WHOOP app client ID"
            className="input-sharp w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Client Secret</label>
          <input
            type="password"
            value={clientSecret}
            onChange={e => setClientSecret(e.target.value)}
            placeholder="Your WHOOP app client secret"
            className="input-sharp w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Redirect URI</label>
          <input
            type="text"
            value={redirectUri}
            onChange={e => setRedirectUri(e.target.value)}
            className="input-sharp w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={!clientId.trim() || !clientSecret.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Save Config
          </button>
          <button
            onClick={handleConnect}
            disabled={!config?.clientId}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/15 text-success border border-success/20 hover:bg-success/25 transition-colors disabled:opacity-40"
          >
            <ExternalLink className="w-3 h-3" /> Connect WHOOP
          </button>
          {status && (
            <span className={`text-xs ${status.startsWith('Error') ? 'text-danger' : 'text-success'}`}>{status}</span>
          )}
        </div>

        {connected && (
          <div className="mt-2 p-2 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-success">
              <Check className="w-3.5 h-3.5" />
              <span>WHOOP is connected. Recovery, sleep, and workout data will be used by the AI Coach for scheduling.</span>
            </div>
          </div>
        )}
      </div>
    </IntegrationCard>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="space-y-3 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-text-primary">Integrations</h2>
        <p className="text-xs text-text-muted">Connect external services to enhance your productivity workflow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <WhoopSetup />
        <DiscordSetup />
        <TelegramSetup />

        {/* Placeholder for future integrations */}
        <div className="card p-6 border-dashed flex flex-col items-center justify-center text-center">
          <Link2 className="w-8 h-8 text-text-muted mb-2" />
          <div className="text-sm font-medium text-text-secondary">More Coming Soon</div>
          <div className="text-xs text-text-muted mt-1">Google Calendar, Notion, Todoist, and more</div>
        </div>
      </div>
    </div>
  )
}
