const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

module.exports.games = () => GameDAO.getAll()

module.exports.game = (_, { gameId, userId }) => {
  const game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError('Game not found', '404')
  }
  // Throw an error if the given user ID is not found as a player in the game
  if (!game.players?.some((el) => el.id === userId)) {
    throw new ApolloError(`Unauthorized. User ID ${userId} is not listed as a player in game ${gameId}.`, '403')
  }
  return game
}
