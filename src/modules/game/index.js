const typeDefs = require('./typedefs')
const Query = require('./resolvers/query')
const Mutation = require('./resolvers/mutation')
const Subscription = require('./resolvers/subscription')

const resolvers = {
    Query,
    Mutation,
    Subscription
}

module.exports = {
    typeDefs,
    resolvers
}