const { DynamoDB: ddb } = require('./DynamoDB')

const TableName = process.env.NODE_ENV === 'development' ? 'scattergories-session-dev' : 'scattergories-session'

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const SessionDAO = {
  createSession: (userId, gameId) => new Promise((resolve, reject) => {
    const session = {
      id: generateSessionId(),
      userId,
      gameId
    }
    ddb.put({
      TableName,
      Item: session
    }, function(err) {
      if (err) {
        reject(err)
      }
      resolve(session)
    })
  }),
  // get: sessionId => authTokens.find(authToken => authToken.sessionId === sessionId),
  // delete: sessionId => {
  //   if (sessionId) {
  //     const index = authTokens.findIndex(authToken => authToken.id === sessionId)
  //     if (index >= 0) {
  //       authTokens.splice(index, 1)
  //     } else {
  //       console.error('Unable to delete authToken. Session ID not found:', sessionId)
  //     }
  //   }
  // }
}

Object.freeze(SessionDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = SessionDAO
