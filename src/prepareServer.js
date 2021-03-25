const { PubSub, gql } = require('apollo-server')
const { GameDAO, PromptsDAO, AuthTokenDAO } = require('./dao')
const { getAuthContext } = require('./authorization')

// These are placeholders that get extended in each module typedef
const typeDefs = gql`
    type Query {
        root: String
    }
    type Mutation {
        root: String
    }
    type Subscription {
        root: String
    }
`

const pubsub = new PubSub()

module.exports = {
  context: ({ req, payload }) => {
    // req is sent with queries and mutations, payload is sent with websocket subscriptions.
    //    Either way, we need to get the current session ID
    let sessionId
    if (req) {
      sessionId = req.headers.authorization?.split(' ')?.[1]
    } else if (payload) {
      sessionId = payload.sessionId
    }

    return {
      auth: getAuthContext(sessionId),
      AuthTokenDAO,
      GameDAO,
      PromptsDAO,
      pubsub
    }
  },
  typeDefs,
  modules: [
    require('./modules/game'),
    require('./modules/timer')
  ]
}
