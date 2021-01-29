const { ApolloServer, PubSub, gql } = require('apollo-server')

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
const server = new ApolloServer({
    context: { pubsub },
    typeDefs,
    modules: [
        require('./modules/game'),
        require('./modules/timer')
    ]
})

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
})
