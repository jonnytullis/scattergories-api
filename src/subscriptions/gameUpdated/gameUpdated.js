const { withFilter } = require('graphql-subscriptions')

const gql = require('../../../gql')

const subscription = gql`
    gameUpdated(gameId: ID!): GameUpdatedResponse!
`

const typeDefs = gql`
    type GameUpdatedResponse {
        updates: GameUpdates
        status: Status
    }
    type GameUpdates {
        players: [User!]
        letter: String
        prompts: Prompts
        settings: Settings
        timer: Timer
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
      auth.authorizeUser()
      return pubsub.asyncIterator([ 'GAME_UPDATED' ])
    },
    (payload, variables) => payload?.gameUpdated?.gameId === variables?.gameId)
  }
}

module.exports = {
  subscription,
  typeDefs,
  resolver
}
