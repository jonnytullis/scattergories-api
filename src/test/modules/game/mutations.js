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


