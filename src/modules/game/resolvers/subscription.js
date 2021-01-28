const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

const channels = {
    letter: (gameId) => `${gameId}_LETTER_CHANNEL`,
    participants: (gameId) => `${gameId}_PARTICIPANTS_CHANNEL`
}

const subscribers = {
    games: [],
    letter: {},
    players: {}
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

module.exports.letter = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }
        const channel = channels.letter(gameId)
        subscribers.letter[channel] = () => pubsub.publish(channel, { letter: game.letter })
        return pubsub.asyncIterator(channel)
    },
    publishLetter: (gameId) => {
        const channel = channels.letter(gameId)
        const callback = subscribers.letter[channel]
        if (callback instanceof Function) {
            callback()
        }
    }
}

module.exports.players = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }
        const channel = channels.participants(gameId)
        subscribers.players[channel] = () => pubsub.publish(channel, { players: game.players })
        setTimeout(subscribers.players[channel], 0) // Give data to the subscriber immediately
        return pubsub.asyncIterator(channel)
    },
    // Publishes a game to anyone subscribed to a given gameId
    publishParticipants: (gameId) => {
        const channel = channels.participants(gameId)
        const callback = subscribers.players[channel]
        if (callback instanceof Function) {
            callback()
        }
    }
}
