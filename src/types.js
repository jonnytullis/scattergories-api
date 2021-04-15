const gql = require('../gql')

module.exports = gql`
    type Game {
        id: String! # Intentionally NOT ID because game ID will always be a 6 letter string
        name: String!
        hostId: ID!
        players: [User!]!
        letter: String!
        prompts: Prompts!
        settings: Settings!
        timer: Timer!
    }
    
    type Prompts {
        hidden: Boolean!
        list: [String!]!
    }
    
    type Settings {
        timerSeconds: Int!
        numPrompts: Int!
    }

    type Timer {
        seconds: Int!
        isRunning: Boolean!
    }

    type User {
        id: ID!
        name: String! # display name
        color: String!
    }
`
