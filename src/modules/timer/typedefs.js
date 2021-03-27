const { gql } = require('apollo-server')

module.exports = gql`
    type Timer {
        seconds: Int!
        remaining: Int!
        isRunning: Boolean!
    }
    extend type Subscription {
        timer(gameId: String!): Timer!
    }
    extend type Mutation {
        startTimer: Timer
        pauseTimer: Timer
        resetTimer: Timer
    }
`
