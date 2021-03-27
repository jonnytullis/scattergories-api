const timers = {} // Key=channel, value=timer

const TimerDAO = {
  get: gameId => timers[gameId],
  add: (gameId, seconds) => {
    timers[gameId] = {
      gameId,
      seconds,
      remaining: seconds,
      isRunning: false,
    }
  },
  delete: gameId => {
    delete timers[gameId]
  },
  update: (gameId, { seconds, isRunning, remaining }) => {
    if (timers[gameId]) {
      if (typeof seconds === 'number' || typeof seconds === 'string') {
        timers[gameId].seconds = seconds
      }
      if (typeof remaining === 'number' || typeof remaining === 'string') {
        timers[gameId].remaining = remaining
      }
      if (typeof isRunning === 'boolean') {
        timers[gameId].isRunning = isRunning
      }
    }
  }
}

Object.freeze(TimerDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = TimerDAO
