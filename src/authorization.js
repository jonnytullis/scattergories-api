const { ForbiddenError } = require('apollo-server')
const { AuthTokenDAO, GameDAO } = require('./dao')

module.exports.getAuthContext = (sessionId) => {
  const authorizeUser = () => {
    const authToken = AuthTokenDAO.get(sessionId)
    const game = GameDAO.get(authToken?.gameId)
    const user = game?.players?.find(player => player.id === authToken?.userId)

    if (!authToken) {
      throw new ForbiddenError('You are not authorized. Invalid session ID.')
    }

    if (!user) {
      throw new ForbiddenError(`You are not an active player in game ${authToken.gameId}`)
    }

    return { game, user }
  }

  const authorizeHost = () => {
    const { game, user } = authorizeUser()

    if (!game || game.hostId !== user.id) {
      throw new ForbiddenError(`You are not authorized. Must be game host to perform this action.`)
    }

    return { game, user }
  }

  return {
    authorizeUser,
    authorizeHost
  }
}
