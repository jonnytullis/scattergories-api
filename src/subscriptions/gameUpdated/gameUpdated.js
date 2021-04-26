const { withFilter } = require('graphql-subscriptions')

const gql = require('../../../gql')

const subscription = gql`
    gameUpdated(gameId: ID!): GameUpdatedResponse!
`

const typeDefs = gql`
    type GameUpdatedResponse {
        gameUpdate: GameUpdate
        status: Status
    }
    type GameUpdate {
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
