const typeDefs = require('./typedefs')
const Query = require('./resolvers/query')
const Mutation = require('./resolvers/mutation')

const resolvers = {
    Query,
    Mutation
}

module.exports = {
    typeDefs,
    resolvers
}