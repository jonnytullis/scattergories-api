const { ApolloError, withFilter } = require('apollo-server')
const { GameDAO } = require('../../../dao')

module.exports.games = {
  subscribe: (_, args, { pubsub }) => {
    return pubsub.asyncIterator([ 'GAME_CREATED' ])
  }
}

module.exports.game = {
  subscribe: withFilter(
    (_, { gameId }, { pubsub }) => {
      const game = GameDAO.get(gameId)
      if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
      }
      return pubsub.asyncIterator([ 'GAME_CHANGED' ])
    },
    (payload, variables) => payload?.game?.id === variables?.gameId
  )
}
