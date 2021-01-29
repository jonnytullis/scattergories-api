const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

const channels = {
    game: (gameId) => `${gameId}_GAME_CHANNEL`,
}

const subscribers = {
    games: [],
    game: {}
}

module.exports.games = {
    subscribe: (_, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15) // Random ID
        const callback = () => pubsub.publish(channel, { games: GameDAO.getAll() })
        subscribers.games.push(callback) // Add this subscriber to the gameSubscriberCallbacks
        setTimeout(callback, 0) // Send this subscriber the data right away
        return pubsub.asyncIterator(channel)
    },
    publishGames: () => { subscribers.games.forEach((fn) => fn()) } // Publish the games available to EVERY subscriber in the list
}

module.exports.game = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }
        const channel = channels.game(gameId)
        subscribers.game[channel] = () => pubsub.publish(channel, { game })
        return pubsub.asyncIterator(channel)
    },
    publishGame: (gameId) => {
        const channel = channels.game(gameId)
        const callback = subscribers.game[channel]
        if (callback instanceof Function) {
            callback()
        }
    }
}
