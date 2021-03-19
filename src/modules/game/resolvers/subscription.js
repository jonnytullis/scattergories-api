const { ApolloError, withFilter } = require('apollo-server')

/** Adds ability to specify what the subscription does when it is canceled **/
function asyncIteratorWithCancel(asyncIterator, onCancel) {
  const asyncReturn = asyncIterator.return

  asyncIterator.return = () => {
    onCancel()
    return asyncReturn ? asyncReturn.call(asyncIterator) : Promise.resolve({ value: undefined, done: true })
  }

  return asyncIterator
}

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

      // Publish the game right away (setTimeout for nextTick)
      setTimeout(() => {
        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      }, 0)

      return asyncIteratorWithCancel(pubsub.asyncIterator([ 'GAME_UPDATED' ]), () => {
        console.log('Subscription canceled')
      })
    },
    (payload, variables) => {
      return payload?.gameUpdated?.game?.id === variables?.gameId ||
        payload?.gameUpdated?.status?.gameId === variables?.gameId
    }
  )
}
