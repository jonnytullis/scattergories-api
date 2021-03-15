const { gql } = require('apollo-server')

module.exports.CREATE_GAME = gql`
    mutation($hostName: String!, $gameName: String!) {
        createGame(hostName: $hostName, gameName: $gameName) {
            gameId
            userId
        }
    }
`
