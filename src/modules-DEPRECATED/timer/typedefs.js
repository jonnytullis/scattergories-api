const { gql } = require('apollo-server')

module.exports = gql`
    
    extend type Mutation {
        startTimer: Timer
        pauseTimer: Timer
        resetTimer: Timer
    }
`
