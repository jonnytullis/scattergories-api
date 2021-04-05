const { ApolloServer } = require('apollo-server')
const { modules, typeDefs, context } = require('./prepareServer')

const server = new ApolloServer({
  modules,
  typeDefs,
  context
})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
