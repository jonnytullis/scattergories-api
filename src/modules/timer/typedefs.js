const { gql } = require('apollo-server')

module.exports = gql`
    type Timer {
        totalSeconds: Int!
        remaining: Int!
    }
    extend type Subscription {
        timer(gameId: String!): Timer!
    }
    extend type Mutation {
        startTimer(gameId: String!, userId: ID!): Timer
        stopTimer(gameId: String!, userId: ID!): Timer
    }
`