const { gql } = require('apollo-server')

module.exports = gql`
    type Timer {
        totalSeconds: Int!
        remaining: Int!
        totalFormatted: String
        remainingFormatted: String
    }

    extend type Subscription {
        timer(gameId: String!): Timer!
    }
    
    extend type Mutation {
        setTimer(gameId: ID!, seconds: Int): Timer
        startTimer(gameId: ID!): Timer
    }
`