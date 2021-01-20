const typeDefs = require('./typedefs')
const Query = require('./resolvers/query')
const Mutation = require('./resolvers/mutation')

module.exports = {
    typeDefs,
    resolvers: {
        Query,
        Mutation
    }
}