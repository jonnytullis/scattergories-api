const { GameDAO } = require('../../../dao')

const gamesSubscribers = []
const onGamesUpdate = (fn) => gamesSubscribers.push(fn)

module.exports.games = {
    subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15) // Random ID
        onGamesUpdate(() => pubsub.publish(channel, { games: GameDAO.getAll() })) // Add this subscriber to the gamesSubscribers
        setTimeout(() => pubsub.publish(channel, { games: GameDAO.getAll() }), 0) // Send this subscriber the data right away
        return pubsub.asyncIterator(channel)
    }
}

module.exports.gamesSubscribers = function () {
    return gamesSubscribers
}