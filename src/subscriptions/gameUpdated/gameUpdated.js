const { withFilter } = require('graphql-subscriptions')

const gql = require('../../../gql')

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

const resolver = {
  gameUpdated: {
    subscribe: withFilter((_, __, context) => {
      const { auth, pubsub } = context
      const { game } = auth.authorizeUser()

      // Publish the game right away (setTimeout for nextTick)
      setTimeout(() => {
        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      }, 5000) // Wait one second for google pubsub to sync

      return pubsub.asyncIterator([ 'GAME_UPDATED' ])
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
