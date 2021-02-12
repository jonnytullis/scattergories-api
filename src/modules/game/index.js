const typeDefs = require('./typedefs')
const Query = require('./resolvers/query')
const Mutation = require('./resolvers/mutation')
const Subscription = require('./resolvers/subscription')

module.exports = {
  typeDefs,
  resolvers: {
    Query,
    Mutation,
    Subscription
  }
}