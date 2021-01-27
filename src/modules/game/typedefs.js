const { gql } = require('apollo-server')

module.exports = gql`
    type Game {
        id: ID!
        name: String
        host: User!
        players: [User!]!
        letter: String
        settings: Settings!
    }

    type Settings {
        timerSeconds: Int!
        numRounds: Int!
        promptsPerRound: Int!
    }

    extend type Query {
        games: [Game!]!
        players(id: ID!): [User!]!
    }

    extend type Mutation {
        createGame(userId: ID!, gameName: String): Game!
        joinGame(gameId: ID!, userId: ID!): Game!
        leaveGame(gameId: ID!, userId: ID!): Game!
        newLetter(gameId: ID): Game!
    }

    extend type Subscription {
        games: [Game!]!
        players(gameId: ID!): [User!]!
        letter(gameId: ID!): String!
    }
`