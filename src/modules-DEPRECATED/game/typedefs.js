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
        newLetter: NewLetterPayload!
        newPrompts: NewPromptsPayload!
        updateSettings(settings: SettingsInput!): Settings!
    }
    extend type Subscription {
    }
    
    ########## PAYLOADS ##########
    type NewLetterPayload {
        letter: String!
    }
    type NewPromptsPayload {
        prompts: [String!]!
    }
`
