const { ApolloError } = require('apollo-server')

module.exports.games = (_, __, { GameDAO }) => GameDAO.getAll()

module.exports.game = (_, { gameId, userId }, { GameDAO }) => {
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

module.exports.user = (_, { gameId, userId }, { GameDAO }) => {
  const game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError('Game not found', '404')
  }
  const user = game.players.find((item) => item.id === userId)
  if (!user) {
    throw new ApolloError('Player not found in game', '404')
  }
  return user
}
