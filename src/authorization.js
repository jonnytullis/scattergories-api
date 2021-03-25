const { ForbiddenError } = require('apollo-server')
const { AuthTokenDAO, GameDAO } = require('./dao')

module.exports.getAuthContext = (sessionId) => {
  const authToken = AuthTokenDAO.get(sessionId)
  const game = GameDAO.get(authToken?.gameId)
  const user = game?.players?.find(player => player.id === authToken?.userId)

  const authorizeUser = () => {
    if (!authToken) {
      throw new ForbiddenError('You are not authorized. Invalid session ID.')
    }

    if (!user) {
      throw new ForbiddenError(`You are not an active player in game ${authToken.gameId}`)
    }
  }

  const authorizeHost = () => {
    authorizeUser()
    if (!game || game.hostId !== user.id) {
      throw new ForbiddenError(`You are not authorized. Must be game host to perform this action.`)
    }
  }

  return {
    authorizeUser,
    authorizeHost,
    authToken,
    game,
    user
  }
}
