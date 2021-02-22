const { gql } = require('apollo-server')

module.exports = gql`
    ########## OBJECTS ##########
    type Game {
        id: String! # Intentionally NOT ID because game ID will always be a 6 letter string
        name: String
        hostId: ID!
        players: [User!]!
        letter: String
        settings: Settings!
    }
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
        game(id: String!): Game!
    }
    extend type Mutation {
        createGame(hostName: String!, gameName: String!): CreateGamePayload!
        joinGame(gameId: String!, userName: String!): JoinGamePayload!
        leaveGame(gameId: String!, userId: ID!): LeaveGamePayload!
        newLetter(gameId: String!, userId: ID!): NewLetterPayload!
    }
    extend type Subscription {
        gameUpdated(gameId: String!): GameSubscriptionPayload!
    }
    
    ########## PAYLOADS ##########
    type CreateGamePayload {
        game: Game!
        user: User!
    }
    type GameEndedPayload {
        gameId: String!
        message: String
    }
    type GameSubscriptionPayload {
        game: Game
        gameEnded: GameEndedPayload
    }
    type JoinGamePayload {
        game: Game!
        user: User!
    }
    type LeaveGamePayload {
        success: Boolean!
    }
    type NewLetterPayload {
        letter: String!
    }
`