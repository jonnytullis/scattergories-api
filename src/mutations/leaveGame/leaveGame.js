const gql = require('../../../gql')

const mutation = gql`
    leaveGame: LeaveGamePayload!
`

const typeDefs = gql`
    type LeaveGamePayload {
        success: Boolean
    }
`

const resolver = {
  async leaveGame (_, __, { auth, pubsub, dataSources }) {
    const { game, user } = auth.authorizeUser()
    let success = true

    try {
      if (auth.isHost) {
        // Delete the game and data associated with the user
        await dataSources.GameDAO.deleteGame(game.id)

        // Notify anyone who is actively subscribed to the game
        const status = { gameId: game.id, message: 'Game ended by host', ended: true }

        await dataSources.SessionDAO.deleteGameSessions(game.id)

        await pubsub.publish('GAME_UPDATED', { gameUpdated: { status } })
      } else {
        // Delete data associated with the user
        const playerIndex = game.players?.findIndex(item => item.id === user.id)
        let updates = { players: await dataSources.GameDAO.removePlayer(game.id, playerIndex) }

        await dataSources.SessionDAO.deleteSession(auth.session.id)

        const status = {
          gameId: game.id,
          message: `${user.name} left the game`
        }
        await pubsub.publish('GAME_UPDATED', { gameUpdated: { updates, status, gameId: game.id } })
      }
    } catch(e) {
      console.error('Error leaving game:', e)
      success = false
    }

    return {
      success
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
