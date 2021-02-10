const { gql } = require('apollo-server')

module.exports = gql`
    type Timer {
        totalSeconds: Int!
        remaining: Int!
        isRunning: Boolean!
    }
    extend type Subscription {
        timer(gameId: String!): Timer!
    }
    extend type Mutation {
        startTimer(gameId: String!, userId: ID!): Timer
        pauseTimer(gameId: String!, userId: ID!): Timer
        resetTimer(gameId: String!, userId: ID!): Timer
    }
`