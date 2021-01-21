const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')
const subscriptions = require('./subscription')

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
