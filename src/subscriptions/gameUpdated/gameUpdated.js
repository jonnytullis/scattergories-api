const { withFilter } = require('apollo-server')

const gql = require('../../../gql')

const subscription = gql`
    gameUpdated(gameId: String!): GameUpdatedResponse!
`

const typeDefs = gql`
    type GameUpdatedResponse {
        game: Game
        status: Status
    }
    type Status {
        gameId: String!
        ended: Boolean
        message: String
    }
`

/** Adds ability to specify what the subscription does when it is canceled by the client **/
// function asyncIteratorWithCancel(asyncIterator, onCancel) {
//   const asyncReturn = asyncIterator.return
//
//   asyncIterator.return = () => {
//     onCancel()
//     return asyncReturn ? asyncReturn.call(asyncIterator) : Promise.resolve({ value: undefined, done: true })
//   }
//
//   return asyncIterator
// }

const resolver = {
  gameUpdated: {
    subscribe: withFilter((_, __, { auth, pubsub }) => {
      const { game } = auth.authorizeUser()

      // In case the user is pending leave
      // pendingInactiveUserCallbacks.userId = undefined

      // Publish the game right away (setTimeout for nextTick)
      setTimeout(() => {
        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      }, 0)

      // return asyncIteratorWithCancel(pubsub.asyncIterator([ 'GAME_UPDATED' ]), () => {
      //   onSubscriptionCancel({ gameId: game.id, userId: user.id }, { pubsub, GameDAO })
      // })

      return pubsub.asyncIterator([ 'GAME_UPDATED' ])
    },
    (payload, variables) => {
      return payload?.gameUpdated?.game?.id === variables?.gameId ||
        payload?.gameUpdated?.status?.gameId === variables?.gameId
    })
  }
}

// If a client subscription becomes inactive, they will be removed from the game
//    if they remain inactive for a certain amount of time. This allows users to
//    refresh the browser window, but if they leave the page, they'll be removed
//    from the game.
// const pendingInactiveUserCallbacks = {} // key: userId, value: function
// function onSubscriptionCancel({ gameId, userId }, { GameDAO }) {
//   const game = GameDAO.get(gameId)
//   if (game && game.players?.some((item) => item.id === userId)) {
//     pendingInactiveUserCallbacks.userId = () => {
//       // leaveGame(undefined, { gameId, userId }, { pubsub, GameDAO })
//     }
//     setTimeout(() => {
//       if (typeof pendingInactiveUserCallbacks.userId === 'function') {
//         pendingInactiveUserCallbacks.userId()
//         delete pendingInactiveUserCallbacks.userId
//       }
//     }, 5000)
//   }
// }

module.exports = {
  subscription,
  typeDefs,
  resolver
}
