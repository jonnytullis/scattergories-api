const { ApolloServer } = require('apollo-server')
const { resolvers, typeDefs, context } = require('./prepareServer')

const server = new ApolloServer({
  resolvers,
  typeDefs,
  context
})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
