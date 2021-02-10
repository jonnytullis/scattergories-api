const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')
const subscriptions = require('./subscription')

// FIXME Add authorization so only the host can start/stop the timer

module.exports.startTimer = (_, { gameId, userId }) => {
    const game = GameDAO.get(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    if (game.hostId === userId) {
        subscriptions.timer.startTimer(gameId)
    }
}

module.exports.pauseTimer = (_, { gameId, userId }) => {
    const game = GameDAO.get(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    if (game.hostId === userId) {
        subscriptions.timer.pauseTimer(gameId)
    }
}

module.exports.resetTimer = (_, { gameId, userId }) => {
    const game = GameDAO.get(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    if (game.hostId === userId) {
        subscriptions.timer.resetTimer(gameId)
    }
}
