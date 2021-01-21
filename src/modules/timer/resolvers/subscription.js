const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

const stoppedChannels = {} // Map of stopped channels. { channel: true } indicates the callback should stop publishing immediately
const timerChannelCallbacks = {} // Map of open channels and their callback functions
module.exports.timer = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }

        const channel = getChannelFromId(gameId)

        timerChannelCallbacks[channel] = () => {
            const timer = createTimer(game.timerSeconds)
            let interval = setInterval(() => {
                if (timer.remaining <= 0 || stoppedChannels[channel] === true) {
                    clearInterval(interval)
                    stoppedChannels[channel] = false
                    return
                }
                pubsub.publish(channel, { timer: JSON.parse(JSON.stringify(timer)) })
                timer.remaining--
            }, 1000)
        }

        return pubsub.asyncIterator(channel)
    },
    startTimer: (gameId) => {
        const channel = getChannelFromId(gameId)
        const callback = timerChannelCallbacks[channel]
        if (callback instanceof Function) {
            callback()
        }
    },
    stopTimer: (gameId) => {
        const channel = getChannelFromId(gameId)
        stoppedChannels[channel] = true
    }
}

/*
 * Returns a timer channel key given an ID
 */
const getChannelFromId = (id) => `${id}_TIMER_CHANNEL`

/*
 * Creates and returns a new timer
 */
function createTimer(seconds) {
    return {
        totalSeconds: seconds,
        remaining: seconds,
    }
}

