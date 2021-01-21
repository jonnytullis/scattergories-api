const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

const timerSubscribers = []
module.exports.timer = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }
        const channel = `${gameId}_TIMER_CHANNEL` // People in the same game will receive publishes at the same time
        const callback = () => {
            pubsub.publish(channel, { timer: createTimer() })
        }

        timerSubscribers.push(callback)

        setTimeout(callback, 0) // Send this subscriber the data right away
        return pubsub.asyncIterator(channel)
    },
    getSubscribers: () => timerSubscribers
}

const DEFAULT_SECONDS = 180
function createTimer(seconds = DEFAULT_SECONDS) {
    return {
        totalSeconds: seconds,
        remaining: seconds,
    }
}
