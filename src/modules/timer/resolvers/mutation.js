const { ApolloError } = require('apollo-server')
const subscriptions = require('./subscription')

module.exports.startTimer = (_, { gameId, userId }, { GameDAO }) => {
  validateRequest(gameId, userId, GameDAO)
  subscriptions.timer.startTimer(gameId)
}

module.exports.pauseTimer = (_, { gameId, userId }, { GameDAO }) => {
  validateRequest(gameId, userId, GameDAO)
  subscriptions.timer.pauseTimer(gameId)
}

module.exports.resetTimer = (_, { gameId, userId }, { GameDAO }) => {
  validateRequest(gameId, userId, GameDAO)
  subscriptions.timer.resetTimer(gameId)
}

/** Verifies that game exists and that user is host **/
function validateRequest(gameId, userId, GameDAO) {
  const game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError(`Game ID ${gameId} not found`, '404')
  }
  if (game.hostId !== userId) {
    throw new ApolloError('Unauthorized', '403')
  }
}
