const { PubSub, gql } = require('apollo-server')

const queries = require('./queries')
const mutations = require('./mutations')
const subscriptions = require('./subscriptions')
const types = require('./types')
const { GameDAO, SessionDAO } = require('./dao')
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
  context: async ({ req, connection, payload }) => {
    // req is sent with queries and mutations, payload is sent with websocket subscriptions.
    //    Either way, we need to get the current session ID
    let sessionId
    if (req) {
      sessionId = req.headers.authorization?.split(' ')?.[1]
    } else if (connection) {
      // connection context for graphql playground, payload for react app
      const authString = connection.context?.authorization || payload?.authorization
      sessionId = authString?.split(' ')?.[1]
    }

    // Get the auth context resources
    const auth = await getAuthContext(sessionId)

    const dataSources = {
      SessionDAO,
      GameDAO
    }

    return {
      auth,
      dataSources,
      pubsub
    }
  },
  typeDefs,
  resolvers,
}
