const authTokens = [] // FIXME this will eventually be a database

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// type AuthToken = {
//    sessionId: ID!
//    userId: ID!
//    gameId: ID!
// }
const AuthTokenDAO = {
  add: (userId, gameId) => {
    const authToken = {
      sessionId: generateSessionId(),
      userId,
      gameId
    }
    authTokens.push(authToken)
    return authToken
  },
  get: sessionId => authTokens.find(authToken => authToken.sessionId === sessionId),
  delete: sessionId => {
    if (sessionId) {
      const index = authTokens.findIndex(authToken => authToken.id === sessionId)
      if (index >= 0) {
        authTokens.splice(index, 1)
      } else {
        console.error('Unable to delete authToken. Session ID not found:', sessionId)
      }
    }
  }
}

Object.freeze(AuthTokenDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = AuthTokenDAO
