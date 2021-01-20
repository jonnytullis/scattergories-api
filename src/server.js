const {
    ApolloServer,
    gql,
    ApolloError
} = require('apollo-server')

const typeDefs = gql`
    type Game {
        id: ID!
        name: String
        host: User!
        players: [User!]!
        diceValue: String
    }

    type User {
        id: ID! # TODO Add authorization so users can only see their own user ID
        name: String! # This is their display name
    }

    type Query {
        games: [Game!]!
        game(id: ID!): Game!
        users: [User!]!
    }

    type Mutation {
        createUser(name: String): User!, # createUser needs to be done before anything else
        updateUser(userId: ID!, name: String!): User!
        createGame(userId: ID!, gameName: String): Game!
        joinGame(gameId: ID!, userId: ID!): Game!
        leaveGame(gameId: ID!, userId: ID!): Game!
    }
`

function generateGameId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function generateUserId() {
    return Math.random().toString(36).slice(2, 30)
}

function defaultUserName() {
    return 'Mysterious Giraffe'
}

// TODO: These will need to be stored in a DB instead of local memory
const games = []
const users = []

const resolvers = {
    Query: {
        games: () => games,
        game: (_, { id }) => {
            const game = games.find(game => game.id === id)
            return game || new ApolloError('Game not found', '404')
        },
        users: () => users,
    },
    Mutation: {
        createUser: (_, { name = '' }) => {
            const user = {
                id: generateUserId(),
                name: name.trim() || defaultUserName()
            }

            users.push(user)

            return user
        },
        createGame: (_, { userId, gameName = '' }) => {
            const host = users.find(v => v.id === userId)
            if (!host) {
                throw new ApolloError('User ID not found', '404')
            }
            const game = {
                id: generateGameId(),
                name: gameName.trim() || `${host.name}'s Game`,
                host,
                players: []
            }

            games.push(game)

            return game
        },
        joinGame: (_, { gameId, userId }) => {
            // Find the game
            const game = games.find(game => game.id === gameId)
            if (!game) {
                throw new ApolloError(`Game ID ${gameId} not found`, '404')
            }
            // Find the user
            const user = users.find(user => user.id === userId)
            if (!user) {
                throw new ApolloError(`User ID ${userId} not found`, '404')
            }

            game.players.push(user)

            return game
        },
        leaveGame: (gameId, userId) => {
            // Find the game
            const game = games.find(game => game.id === gameId)
            if (!game) {
                throw new ApolloError(`Game ID ${gameId} not found`, '404')
            }

            const playerIndex = game.players.findIndex(user => user.id === userId)

            if (playerIndex < 0) {
                throw new ApolloError(`Player not found in Game with ID ${gameId}`, '404')
            }

            game.players.splice(playerIndex, 1)

            return game
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
})
