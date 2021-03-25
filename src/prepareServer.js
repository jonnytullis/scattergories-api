const { PubSub, gql } = require('apollo-server')
const { GameDAO, PromptsDAO } = require('./dao')
const { getAuth } = require('./authorization')

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
    const auth = getAuth(req)
    return {
      auth,
      pubsub,
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
