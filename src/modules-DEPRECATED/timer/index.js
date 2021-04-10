const typeDefs = require('./typedefs')
const Subscription = require('./resolvers/subscription')
const Mutation = require('./resolvers/mutation')

module.exports = {
  typeDefs,
  resolvers: {
    Mutation,
    Subscription
  }
}