const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

const timers = {} // Timers live in memory. Map of active timers. Key=channel, value=timer
module.exports.timer = {
  subscribe: (_, { gameId }, { pubsub }) => {
    const game = GameDAO.get(gameId)
    if (!game) {
      throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }

    const channel = getChannelFromId(gameId)

    const publishTimer = () => {
      pubsub.publish(channel, { timer: JSON.parse(JSON.stringify(timers[channel]?.timer || {})) })
    }

    if (!timers[channel]) {
      timers[channel] = {
        timer: createTimer(game.settings?.timerSeconds || 180),
        interval: null,
        start: () => {
          if (!timers[channel]?.timer) {
            timers[channel].timer = createTimer(game.settings?.timerSeconds || 180)
          }

          timers[channel].timer.isRunning = true
          publishTimer()
          timers[channel].interval = setInterval(() => {
            if (timers[channel].timer.remaining <= 0) {
              clearInterval(timers[channel].interval)
              timers[channel].timer.isRunning = false
              publishTimer()
              return
            }
            timers[channel].timer.remaining--
            publishTimer()
          }, 1000)
        },
        pause: () => {
          timers[channel].timer.isRunning = false
          clearInterval(timers[channel].interval)
          publishTimer()
        },
        reset: () => {
          timers[channel].timer.isRunning = false
          clearInterval(timers[channel].interval)
          timers[channel].timer = createTimer(game.settings?.timerSeconds || 180)
          publishTimer()
        },
      }
    }

    // Send a the timer right away (on next tick)
    setTimeout(() => {
      publishTimer(channel)
    }, 0)

    return pubsub.asyncIterator(channel)
  },
  startTimer: (gameId) => {
    const channel = getChannelFromId(gameId)
    timers[channel]?.start()
  },
  pauseTimer: (gameId) => {
    const channel = getChannelFromId(gameId)
    timers[channel]?.pause()
  },
  resetTimer: (gameId) => {
    const channel = getChannelFromId(gameId)
    timers[channel]?.reset()
  },
  deleteTimer: (gameId) => {
    const channel = getChannelFromId(gameId)
    delete timers[channel]
  }
}

/*
 * Returns a timer channel key given an ID
 */
const getChannelFromId = (id) => `${id}_TIMER_CHANNEL`

/*
 * Creates and returns a new timer
 *      I'm creating the timer object here because it really only matters
 *      within the context of the subscription. No timer is saved in the database.
 */
function createTimer(seconds) {
  return {
    seconds,
    remaining: seconds,
    isRunning: false,
  }
}

