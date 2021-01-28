const { gql } = require('apollo-server')

module.exports = gql`
    ########## OBJECTS ##########
    type Game {
        id: String!
        name: String
        host: User!
        players: [User!]!
        letter: String
        settings: Settings!
    }
    type Settings {
        timerSeconds: Int!
        numRounds: Int!
        numPrompts: Int!
    }

    ########## GQL ##########
    extend type Query {
        games: [Game!]!
        game: Game!
        players(id: ID!): [User!]!
    }
    extend type Mutation {
        createGame(userId: ID!, gameName: String): CreateGamePayload!
        joinGame(gameId: String!, userId: ID!): JoinGamePayload!
        leaveGame(gameId: String!, userId: ID!): LeaveGamePayload!
        newLetter(gameId: String): NewLetterPayload!
    }
    extend type Subscription {
        players(gameId: String!): [User!]!
        letter(gameId: String!): String!
    }
    
    ########## PAYLOADS ##########
    type CreateGamePayload {
        success: Boolean!
        game: Game!
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