const { gql } = require('apollo-server')

module.exports = gql`
    input SettingsInput {
        timerSeconds: Int
        numRounds: Int
        numPrompts: Int
    }

    ########## GQL ##########
    extend type Query {
        games: [Game!]!
        user: User!
    }
    extend type Mutation {
        updateSettings(settings: SettingsInput!): Settings!
    }

`
