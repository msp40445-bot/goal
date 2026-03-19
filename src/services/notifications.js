let notificationPermission = 'default'

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  notificationPermission = await Notification.requestPermission()
  return notificationPermission
}

export function sendNotification(title, body, options = {}) {
  if (notificationPermission !== 'granted') return null

  const notification = new Notification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    silent: options.silent || false,
    tag: options.tag || 'goalforge',
    ...options
  })

  if (options.onClick) {
    notification.onclick = options.onClick
  }

  return notification
}

export function scheduleReminder(title, body, delayMs) {
  return setTimeout(() => {
    sendNotification(title, body, { tag: `reminder-${Date.now()}` })
    playAlarmSound()
  }, delayMs)
}

export function playAlarmSound(type = 'notification') {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  if (type === 'alarm') {
    oscillator.frequency.value = 880
    gainNode.gain.value = 0.3
    oscillator.type = 'sine'

    oscillator.start()
    setTimeout(() => {
      oscillator.frequency.value = 660
    }, 200)
    setTimeout(() => {
      oscillator.frequency.value = 880
    }, 400)
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
    }, 600)
  } else if (type === 'complete') {
    oscillator.frequency.value = 523
    gainNode.gain.value = 0.2
    oscillator.type = 'sine'

    oscillator.start()
    setTimeout(() => {
      oscillator.frequency.value = 659
    }, 100)
    setTimeout(() => {
      oscillator.frequency.value = 784
    }, 200)
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
    }, 350)
  } else {
    oscillator.frequency.value = 600
    gainNode.gain.value = 0.15
    oscillator.type = 'sine'

    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
    }, 150)
  }
}

export function getNotificationPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}
