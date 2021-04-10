const gql = require('../gql')

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
    
    type User {
        id: ID!
        name: String! # display name
        color: String!
    }
    
    type Settings {
        timerSeconds: Int!
        numPrompts: Int!
    }
`
