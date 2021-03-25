const { AuthTokenDAO, GameDAO } = require('./dao')

module.exports.authorize = (req) => {
  const auth = {}

  if (req?.headers?.authorization) {
    const sessionId = req.headers.authorization.split(' ')[1]
    const authToken = AuthTokenDAO.get(sessionId)

    auth.sessionId = authToken?.sessionId
    auth.game = GameDAO.get(authToken?.gameId)
    auth.user = auth.game?.players?.find(player => player.id === authToken?.userId)

    if (auth.game && auth.user) {
      auth.isHost = auth.user?.id === auth.game?.hostId
    } else {
      auth.isHost = false
    }
  }

  return auth
}
