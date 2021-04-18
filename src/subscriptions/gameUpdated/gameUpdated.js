const { withFilter } = require('apollo-server')

const gql = require('../../../gql')
const leaveGame = require('../../mutations/leaveGame/leaveGame')

const subscription = gql`
    gameUpdated(gameId: ID!): GameUpdatedResponse!
`

const typeDefs = gql`
    type GameUpdatedResponse {
        game: Game
        status: Status
    }
    type Status {
        gameId: ID!
        ended: Boolean
        message: String
    }
`

/** Adds ability to specify what the subscription does when it is canceled by the client **/
function asyncIteratorWithCancel(asyncIterator, onCancel) {
  const asyncReturn = asyncIterator.return

  asyncIterator.return = () => {
    onCancel()
    return asyncReturn ? asyncReturn.call(asyncIterator) : Promise.resolve({ value: undefined, done: true })
  }

  return asyncIterator
}

const resolver = {
  gameUpdated: {
    subscribe: withFilter((_, __, context) => {
      const { auth, pubsub, dataSources } = context
      const { game, user } = auth.authorizeUser()

      // Publish the game right away (setTimeout for nextTick)
      setTimeout(() => {
        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      }, 0)

      async function onSubscriptionClose() {
        try {
          const updatedGame = await dataSources.GameDAO.getGame(game.id)
          const updatedUser = updatedGame?.players?.find(player => player.id === user.id)
          if (updatedUser) { // If the game and user still exist, call the leaveGame mutation
            const res = await leaveGame.resolver.leaveGame(null, null, context)
            if (!res.success) {
              console.error('Error leaving game on subscription cancel')
            }
          }
        } catch(e) {
          console.error('Error in onSubscriptionClose:', e)
        }
      }

      return asyncIteratorWithCancel(pubsub.asyncIterator([ 'GAME_UPDATED' ]), onSubscriptionClose)
    },
    (payload, variables) => {
      return payload?.gameUpdated?.game?.id === variables?.gameId ||
        payload?.gameUpdated?.status?.gameId === variables?.gameId
    })
  }
}

module.exports = {
  subscription,
  typeDefs,
  resolver
}
