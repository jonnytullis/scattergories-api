const { PubSub, gql } = require('apollo-server')
const GameDAO = require('./dao/GameDAO')

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
  context: { pubsub, GameDAO },
  typeDefs,
  modules: [
    require('./modules/game'),
    require('./modules/timer')
  ]
}