const { PubSub, gql } = require('apollo-server')

const queries = require('./queries')
const mutations = require('./mutations')
const subscriptions = require('./subscriptions')
const types = require('./types')
const { GameDAO, PromptsDAO, SessionDAO, TimerDAO } = require('./dao')
const { getAuthContext } = require('./authorization')

// These are placeholders that get extended in each module typedef
const typeDefsString = `
  ${types}
  ${mutations.typeDefs}
  ${mutations.mutations}
  ${queries.typeDefs}
  ${queries.queries}
  ${subscriptions.typeDefs}
  ${subscriptions.subscriptions}
`

const typeDefs = gql(typeDefsString)

const resolvers = {
  Query: { ...queries.resolvers },
  Mutation: { ...mutations.resolvers },
  Subscription: { ...subscriptions.resolvers }
}

const pubsub = new PubSub()

module.exports = {
  context: async ({ req, connection }) => {
    // req is sent with queries and mutations, payload is sent with websocket subscriptions.
    //    Either way, we need to get the current session ID
    let sessionId
    if (req) {
      sessionId = req.headers.authorization?.split(' ')?.[1]
    } else if (connection) {
      sessionId = connection.context?.authorization?.split(' ')?.[1]
    }

    // Get the auth context resources
    const auth = await getAuthContext(sessionId)

    return {
      auth,
      SessionDAO,
      GameDAO,
      PromptsDAO,
      TimerDAO,
      pubsub
    }
  },
  typeDefs,
  resolvers,
}
