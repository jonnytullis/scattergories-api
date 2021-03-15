const { gql } = require('apollo-server')

module.exports.CREATE_GAME = gql`
    mutation($hostName: String!, $gameName: String!) {
        createGame(hostName: $hostName, gameName: $gameName) {
            gameId
            userId
        }
    }
`

module.exports.JOIN_GAME = gql`
    mutation($gameId: String!, $userName: String!) {
        joinGame(gameId: $gameId, userName: $userName) {
            userId
            gameId
        }
    }
`

module.exports.LEAVE_GAME = gql`
    mutation($gameId: String!, $userId: ID!) {
        leaveGame(gameId: $gameId, userId: $userId) {
            success
        }
    }
`

module.exports.NEW_LETTER = gql`
    mutation($gameId: String!, $userId: ID!) {
        newLetter(gameId: $gameId, userId: $userId) {
            letter
        }
    }
`


