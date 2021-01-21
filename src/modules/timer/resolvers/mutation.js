const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')
const subscriptions = require('./subscription')

// FIXME Add authorization so only the host can start/stop the timer

module.exports.startTimer = (_, { gameId }) => {
    const game = GameDAO.get(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    subscriptions.timer.startTimer(gameId)
}

module.exports.stopTimer = (_, { gameId }) => {
    const game = GameDAO.get(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    subscriptions.timer.stopTimer(gameId)
}
