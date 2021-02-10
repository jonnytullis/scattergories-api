const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

const channelTimers = {} // Map of active timers. Key=channel, value=timer
module.exports.timer = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }

        const channel = getChannelFromId(gameId)

        const publishTimer = () => {
            pubsub.publish(channel, { timer: JSON.parse(JSON.stringify(channelTimers[channel].timer)) })
        }

        if (!channelTimers[channel]) {
            channelTimers[channel] = {
                timer: createTimer(game.settings?.timerSeconds || 180),
                interval: null,
                start: () => {
                    if (!channelTimers[channel].timer) {
                        channelTimers[channel].timer = createTimer(game.settings?.timerSeconds || 180)
                    }

                    channelTimers[channel].timer.isRunning = true
                    publishTimer()
                    channelTimers[channel].interval = setInterval(() => {
                        if (channelTimers[channel].timer.remaining <= 0) {
                            clearInterval(channelTimers[channel].interval)
                            channelTimers[channel].timer.isRunning = false
                            publishTimer()
                            return
                        }
                        channelTimers[channel].timer.remaining--
                        publishTimer()
                    }, 1000)
                },
                pause: () => {
                    channelTimers[channel].timer.isRunning = false
                    clearInterval(channelTimers[channel].interval)
                    publishTimer()
                },
                reset: () => {
                    channelTimers[channel].timer.isRunning = false
                    clearInterval(channelTimers[channel].interval)
                    channelTimers[channel].timer = createTimer(game.settings?.timerSeconds || 180)
                    publishTimer()
                },
            }
        }

        // Send a the timer right away
        publishTimer(channel)

        return pubsub.asyncIterator(channel)
    },
    startTimer: (gameId) => {
        const channel = getChannelFromId(gameId)
        channelTimers[channel].start()
    },
    pauseTimer: (gameId) => {
        const channel = getChannelFromId(gameId)
        channelTimers[channel].pause()
    },
    resetTimer: (gameId) => {
        const channel = getChannelFromId(gameId)
        channelTimers[channel].reset()
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
        totalSeconds: seconds,
        remaining: seconds,
        isRunning: false,
    }
}

