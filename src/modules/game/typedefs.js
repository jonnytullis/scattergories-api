const { gql } = require('apollo-server')

module.exports = gql`
    ########## OBJECTS ##########
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

    ########## GQL ##########
    extend type Query {
        game: Game!
        players(id: ID!): [User!]!
    }
    extend type Mutation {
        createGame(userId: ID!, gameName: String): CreateGamePayload!
        joinGame(gameId: ID!, userId: ID!): JoinGamePayload!
        leaveGame(gameId: ID!, userId: ID!): LeaveGamePayload!
        newLetter(gameId: ID): NewLetterPayload!
    }
    extend type Subscription {
        games: [Game!]!
        players(gameId: ID!): [User!]!
        letter(gameId: ID!): String!
    }
    
    ########## PAYLOADS ##########
    type CreateGamePayload {
        success: Boolean!
        gameId: ID
    }
    type JoinGamePayload {
        success: Boolean!
        gameId: ID
    }
    type LeaveGamePayload {
        success: Boolean!
    }
    type NewLetterPayload {
        success: Boolean!
        letter: String!
    }
`