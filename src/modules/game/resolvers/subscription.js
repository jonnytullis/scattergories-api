const { ApolloError } = require('apollo-server')
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
    publishGames: () => { gamesSubscribers.forEach((fn) => fn()) } // Publish the games available to EVERY subscriber in the list
}

const playersChannelCallbacks = []
module.exports.players = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }
        const channel = getParticipantsChannel(gameId)
        playersChannelCallbacks[channel] = () => pubsub.publish(channel, { players: game.players })
        return pubsub.asyncIterator(channel)
    },
    // Publishes a game to anyone subscribed to a given gameId
    publishParticipants: (gameId) => {
        const channel = getParticipantsChannel(gameId)
        const callback = playersChannelCallbacks[channel]
        if (callback instanceof Function) {
            callback()
        }
    }
}
const getParticipantsChannel = (gameId) => `${gameId}_PARTICIPANTS_CHANNEL`

const letterChannelCallbacks = []
module.exports.letter = {
    subscribe: (_, { gameId }, { pubsub }) => {
        const game = GameDAO.get(gameId)
        if (!game) {
            throw new ApolloError(`Game ID ${gameId} not found`, '404')
        }
        const channel = getParticipantsChannel(gameId)
        playersChannelCallbacks[channel] = () => pubsub.publish(channel, { letter: game.letter })
        return pubsub.asyncIterator(channel)
    },
    publishLetter: (gameId) => {
        const channel = getLetterChannel(gameId)
        const callback = letterChannelCallbacks[channel]
        if (callback instanceof Function) {
            callback()
        }
    }
}
const getLetterChannel = (gameId) => `${gameId}_LETTER_CHANNEL`
