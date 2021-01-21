const { GameDAO } = require('../../../dao')

const gamesSubscribers = []
module.exports.games = {
    subscribe: (_, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15) // Random ID
        const callback = () => pubsub.publish(channel, { games: GameDAO.getAll() })
        gamesSubscribers.push(callback) // Add this subscriber to the gameSubscriberCallbacks
        setTimeout(callback, 0) // Send this subscriber the data right away
        return pubsub.asyncIterator(channel)
    },
    getSubscribers: () => gamesSubscribers
}
