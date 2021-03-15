const server = require('./prepareServer')

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
