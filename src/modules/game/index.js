const { gql, ApolloError } = require('apollo-server')
const { GameDAO, UserDAO } = require('../../dao')

const typeDefs = gql`
    type Game {
        id: ID!
        name: String
        host: User!
        players: [User!]!
        diceValue: String
    }

    extend type Query {
        games: [Game!]!
        game(id: ID!): Game!
    }

    extend type Mutation {
        createGame(userId: ID!, gameName: String): Game!
        joinGame(gameId: ID!, userId: ID!): Game!
        leaveGame(gameId: ID!, userId: ID!): Game!
    }

    extend type Subscription {
        games: [Game!]!
    }
`

function generateGameId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase()
}

// TODO: These will need to be stored in a DB instead of local memory
const gamesSubscribers = []
const onGamesUpdate = (fn) => gamesSubscribers.push(fn)

const resolvers = {
    Query: {
        games: () => GameDAO.getAll(),
        game: (_, { id }) => {
            const game = GameDAO.get(id)
            return game || new ApolloError('Game not found', '404')
        }
    },
    Mutation: {
        createGame: (_, { userId, gameName = '' }) => {
            const host = UserDAO.get(userId)
            if (!host) {
                throw new ApolloError('User ID not found', '404')
            }
            const game = {
                id: generateGameId(),
                name: gameName.trim() || `${host.name}'s Game`,
                host,
                players: []
            }

            GameDAO.add(game)

            gamesSubscribers.forEach(fn => fn())

            return game
        },
        joinGame: (_, { gameId, userId }) => {
            // Find the game
            const game = GameDAO.get(gameId)
            if (!game) {
                throw new ApolloError(`Game ID ${gameId} not found`, '404')
            }
            // Find the user
            const user = UserDAO.get(userId)
            if (!user) {
                throw new ApolloError(`User ID ${userId} not found`, '404')
            }

            game.players.push(user)

            return game
        },
        leaveGame: (gameId, userId) => {
            // Find the game
            const game = GameDAO.get(gameId)
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
    },
    Subscription: {
        games: {
            subscribe: (parent, args, { pubsub }) => {
                const channel = Math.random().toString(36).slice(2, 15) // Random ID
                onGamesUpdate(() => pubsub.publish(channel, { games: GameDAO.getAll() })) // Add this subscriber to the gamesSubscribers
                setTimeout(() => pubsub.publish(channel, { games: GameDAO.getAll() }), 0) // Send this subscriber the data right away
                return pubsub.asyncIterator(channel)
            }
        }
    }
}

module.exports = {
    typeDefs,
    resolvers
}