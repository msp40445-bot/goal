const WHOOP_API_BASE = 'https://api.prod.whoop.com'
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth'
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'

const SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:workout',
  'read:sleep',
  'read:profile',
  'read:body_measurement'
]

function getStoredAuth() {
  try {
    const data = localStorage.getItem('goalforge-whoop-auth')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function storeAuth(authData) {
  localStorage.setItem('goalforge-whoop-auth', JSON.stringify({
    ...authData,
    stored_at: Date.now()
  }))
}

function clearAuth() {
  localStorage.removeItem('goalforge-whoop-auth')
}

export function getWhoopConfig() {
  try {
    const data = localStorage.getItem('goalforge-whoop-config')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setWhoopConfig(config) {
  localStorage.setItem('goalforge-whoop-config', JSON.stringify(config))
}

export function isWhoopConnected() {
  const auth = getStoredAuth()
  return !!(auth && auth.access_token)
}

export function getAuthUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state: crypto.randomUUID()
  })
  return `${WHOOP_AUTH_URL}?${params.toString()}`
}

export async function exchangeCode(code, clientId, clientSecret, redirectUri) {
  const response = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    })
  })

  if (!response.ok) throw new Error('Failed to exchange auth code')
  const data = await response.json()
  storeAuth(data)
  return data
}

async function refreshToken() {
  const auth = getStoredAuth()
  if (!auth?.refresh_token) throw new Error('No refresh token')
  const config = getWhoopConfig()
  if (!config) throw new Error('No Whoop config')

  const response = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: auth.refresh_token,
      client_id: config.clientId,
      client_secret: config.clientSecret
    })
  })

  if (!response.ok) {
    clearAuth()
    throw new Error('Token refresh failed')
  }
  const data = await response.json()
  storeAuth(data)
  return data
}

async function apiRequest(endpoint) {
  let auth = getStoredAuth()
  if (!auth?.access_token) throw new Error('Not authenticated')

  // Check if token might be expired (stored > 50 minutes ago)
  if (auth.stored_at && Date.now() - auth.stored_at > 50 * 60 * 1000) {
    try {
      auth = await refreshToken()
    } catch {
      throw new Error('Session expired. Please reconnect Whoop.')
    }
  }

  const response = await fetch(`${WHOOP_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${auth.access_token}` }
  })

  if (response.status === 401) {
    try {
      auth = await refreshToken()
      const retry = await fetch(`${WHOOP_API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${auth.access_token}` }
      })
      if (!retry.ok) throw new Error('API request failed after refresh')
      return retry.json()
    } catch {
      clearAuth()
      throw new Error('Session expired. Please reconnect Whoop.')
    }
  }

  if (!response.ok) throw new Error(`Whoop API error: ${response.status}`)
  return response.json()
}

// --- Data Fetching ---

export async function getUserProfile() {
  return apiRequest('/v1/user/profile/basic')
}

export async function getBodyMeasurements() {
  return apiRequest('/v2/user/measurement/body')
}

export async function getCycles(startDate, endDate) {
  const params = new URLSearchParams()
  if (startDate) params.set('start', startDate)
  if (endDate) params.set('end', endDate)
  return apiRequest(`/v1/cycle?${params.toString()}`)
}

export async function getRecoveryCollection(startDate, endDate) {
  const params = new URLSearchParams()
  if (startDate) params.set('start', startDate)
  if (endDate) params.set('end', endDate)
  return apiRequest(`/v1/recovery?${params.toString()}`)
}

export async function getSleepCollection(startDate, endDate) {
  const params = new URLSearchParams()
  if (startDate) params.set('start', startDate)
  if (endDate) params.set('end', endDate)
  return apiRequest(`/v1/activity/sleep?${params.toString()}`)
}

export async function getWorkoutCollection(startDate, endDate) {
  const params = new URLSearchParams()
  if (startDate) params.set('start', startDate)
  if (endDate) params.set('end', endDate)
  return apiRequest(`/v1/activity/workout?${params.toString()}`)
}

export async function getActivityMapping(v1ActivityId) {
  return apiRequest(`/v1/activity-mapping/${v1ActivityId}`)
}

// --- Aggregated Data for AI ---

export async function getWhoopSummary() {
  try {
    const now = new Date()
    const yesterday = new Date(now - 86400000)
    const startDate = yesterday.toISOString()

    const [recovery, sleep, workouts] = await Promise.all([
      getRecoveryCollection(startDate).catch(() => ({ records: [] })),
      getSleepCollection(startDate).catch(() => ({ records: [] })),
      getWorkoutCollection(startDate).catch(() => ({ records: [] }))
    ])

    const latestRecovery = recovery.records?.[0]
    const latestSleep = sleep.records?.[0]
    const recentWorkouts = workouts.records || []

    return {
      connected: true,
      recovery: latestRecovery ? {
        score: latestRecovery.score?.recovery_score,
        hrv: latestRecovery.score?.hrv_rmssd_milli,
        restingHR: latestRecovery.score?.resting_heart_rate,
        spo2: latestRecovery.score?.spo2_percentage,
        state: latestRecovery.score_state
      } : null,
      sleep: latestSleep ? {
        performance: latestSleep.score?.sleep_performance_percentage,
        duration: latestSleep.score?.stage_summary?.total_in_bed_time_milli,
        efficiency: latestSleep.score?.sleep_efficiency_percentage,
        isNap: latestSleep.nap,
        state: latestSleep.score_state
      } : null,
      workouts: recentWorkouts.map(w => ({
        sport: w.sport_name,
        strain: w.score?.strain,
        avgHR: w.score?.average_heart_rate,
        calories: w.score?.kilojoule ? Math.round(w.score.kilojoule * 0.239006) : null,
        duration: w.end && w.start ? Math.round((new Date(w.end) - new Date(w.start)) / 60000) : null
      }))
    }
  } catch {
    return { connected: false, recovery: null, sleep: null, workouts: [] }
  }
}

export function disconnectWhoop() {
  clearAuth()
}
