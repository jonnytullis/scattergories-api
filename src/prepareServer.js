const { PubSub, gql } = require('apollo-server')
const { AuthTokenDAO, GameDAO, PromptsDAO } = require('./dao')
const { authorize } = require('./authorization')

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
  context: ({ req }) => {
    const auth = authorize(req)
    return {
      auth,
      pubsub,
      AuthTokenDAO,
      GameDAO,
      PromptsDAO
    }
  },
  typeDefs,
  modules: [
    require('./modules/game'),
    require('./modules/timer')
  ]
}
