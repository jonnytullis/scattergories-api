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
  async leaveGame (_, __, { auth, pubsub, SessionDAO, GameDAO, TimerDAO }) {
    let { game, user } = auth.authorizeUser()
    let success = true

    try {
      if (auth.isHost) {
        // Delete the game and data associated with the user
        await GameDAO.deleteGame(game.id)
        TimerDAO.delete(game.id)

        // Notify anyone who is actively subscribed to the game
        const status = { gameId: game.id, message: 'Game ended by host', ended: true }

        await SessionDAO.deleteGameSessions(game.id)

        await pubsub.publish('GAME_UPDATED', { gameUpdated: { status } })
      } else {
        // Delete data associated with the user
        const playerIndex = game.players?.findIndex(item => item.id === user.id)
        game.players = await GameDAO.removePlayer(game.id, playerIndex)

        await SessionDAO.deleteSession(auth.session.id)

        // Get the updated game before publishing
        await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
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
