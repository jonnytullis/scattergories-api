const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')
const subscriptions = require('./subscription')

module.exports.startTimer = (_, { gameId, userId }) => {
  validateRequest(gameId, userId)
  subscriptions.timer.startTimer(gameId)
}

module.exports.pauseTimer = (_, { gameId, userId }) => {
  validateRequest(gameId, userId)
  subscriptions.timer.pauseTimer(gameId)
}

module.exports.resetTimer = (_, { gameId, userId }) => {
  validateRequest(gameId, userId)
  subscriptions.timer.resetTimer(gameId)
}

function validateRequest(gameId, userId) {
  const game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError(`Game ID ${gameId} not found`, '404')
  }
  if (game.hostId !== userId) {
    throw new ApolloError('Unauthorized', '403')
  }
}
