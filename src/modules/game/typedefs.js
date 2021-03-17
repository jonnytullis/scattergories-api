const { gql } = require('apollo-server')

module.exports = gql`
    type Game {
        id: String! # Intentionally NOT ID because game ID will always be a 6 letter string
        name: String
        hostId: ID!
        players: [User!]!
        letter: String
        prompts: [String!]!
        settings: Settings!
    }
    
    ########## SUB-TYPES ##########
    type User {
        id: ID!
        name: String! # display name
    }
    type Settings {
        timerSeconds: Int!
        numRounds: Int!
        numPrompts: Int!
    }

    ########## GQL ##########
    extend type Query {
        games: [Game!]!
        game(gameId: String!, userId: ID!): Game!
    }
    extend type Mutation {
        createGame(hostName: String!, gameName: String!): CreateGamePayload!
        joinGame(gameId: String!, userName: String!): JoinGamePayload!
        leaveGame(gameId: String!, userId: ID!): LeaveGamePayload!
        newLetter(gameId: String!, userId: ID!): NewLetterPayload!
    }
    extend type Subscription {
        gameUpdated(gameId: String!, userId: ID!): GameUpdatedPayload!
    }
    
    ########## PAYLOADS ##########
    type CreateGamePayload {
        gameId: String!
        userId: ID!
    }
    
    type JoinGamePayload {
        gameId: String!
        userId: ID!
    }
    type LeaveGamePayload {
        success: Boolean!
    }
    type NewLetterPayload {
        letter: String!
    }
    type GameUpdatedPayload {
        game: Game
        status: Status
    }
    type Status {
        gameId: String!
        ended: Boolean
        message: String
    }
`
