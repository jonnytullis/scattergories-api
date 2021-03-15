const { gql } = require('apollo-server')

module.exports.GAME = gql`
    query($gameId: String!, $userId: ID!) {
        game(gameId: $gameId, userId: $userId) {
            id
            name
            hostId
            players {
                name
                id
            }
            letter
            settings {
                timerSeconds
                numPrompts
                numRounds
            }
        }
    }
`
