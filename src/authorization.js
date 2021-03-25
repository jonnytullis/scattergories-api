const { ForbiddenError } = require('apollo-server')
const { AuthTokenDAO, GameDAO } = require('./dao')

module.exports.getAuth = (req) => {
  const auth = {} // { sessionId:String, user:User }

  const sessionId = req?.headers?.authorization?.split(' ')?.[1]
  const authToken = AuthTokenDAO.get(sessionId)

  auth.sessionId = authToken?.sessionId
  const game = GameDAO.get(authToken?.gameId)
  auth.user = game?.players?.find(player => player.id === authToken?.userId)
  auth.gameId = authToken?.gameId

  auth.authorizeUser = () => {
    if (!authToken) {
      throw new ForbiddenError('You are not authorized')
    }

    if (!auth.user) {
      throw new ForbiddenError(`You are not an active player in game ${authToken.gameId}`)
    }
  }

  auth.authorizeHost = () => {
    auth.authorizeUser()

    if (!game || game.hostId !== auth.user.id) {
      throw new ForbiddenError(`You are not authorized. Must be game host to perform this action.`)
    }
  }

  return auth
}
