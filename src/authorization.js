const { ForbiddenError } = require('apollo-server')
const { SessionDAO, GameDAO } = require('./dao')

module.exports.getAuthContext = async (sessionId) => {
  let session, game, user

  if (sessionId) {
    try {
      session = await SessionDAO.getSession(sessionId)
      if (session?.gameId) {
        game = await GameDAO.getGame(session?.gameId)
        user = game?.players?.find(player => player.id === session?.userId)
      }
    } catch(e) {
      console.error(`Error getting auth context for session id ${sessionId}:`, e)
    }
  }

  const authorizeUser = () => {
    if (!session) {
      throw new ForbiddenError('Invalid session ID')
    }

    if (!user) {
      throw new ForbiddenError(`You are not an active player in game ${session.gameId}`)
    }

    return { game, user }
  }

  const authorizeHost = () => {
    if (!game || game.hostId !== user.id) {
      throw new ForbiddenError(`Must be game host to perform this action`)
    }

    return { game, user }
  }

  return {
    authorizeUser,
    authorizeHost,
    session,
    isHost: game?.hostId && user?.id && game.hostId === user.id
  }
}
