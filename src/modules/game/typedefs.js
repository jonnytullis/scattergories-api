const { gql } = require('apollo-server')

module.exports = gql`
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
        rollDice(gameId: ID): Game!
    }

    extend type Subscription {
        games: [Game!]!
    }
`