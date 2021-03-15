const { ApolloError, withFilter } = require('apollo-server')

module.exports.games = {
  subscribe: (_, args, { pubsub }) => {
    return pubsub.asyncIterator([ 'GAME_CREATED' ])
  }
}

module.exports.gameUpdated = {
  subscribe: withFilter(
    (_, { gameId, userId }, { pubsub, GameDAO }) => {
      const game = GameDAO.get(gameId)
      if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
      }
      // Throw an error if the given user ID is not found as a player in the game
      if (!game.players?.some((el) => el.id === userId)) {
        throw new ApolloError(`Unauthorized. User ID ${userId} is not listed as a player in game ${gameId}.`, '403')
      }
      return pubsub.asyncIterator([ 'GAME_UPDATED' ])
    },
    (payload, variables) => {
      return payload?.gameUpdated?.game?.id === variables?.gameId ||
        payload?.gameUpdated?.status?.gameId === variables?.gameId
    }
  )
}
