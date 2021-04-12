const { DynamoDB: ddb } = require('./DynamoDB')

const TableName = process.env.NODE_ENV === 'development' ? 'scattergories-session-dev' : 'scattergories-session-prd'

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

    const params = {
      TableName,
      Item: session
    }

    ddb.put(params, (err) => {
      if (err) {
        reject(err)
      }
      resolve(session)
    })
  }),
  getSession: sessionId => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Key: {
        id: sessionId
      }
    }

    ddb.get(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Item)
    })
  }),
  deleteSession: sessionId => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Key: {
        id: sessionId
      }
    }

    ddb.delete(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Item)
    })
  })
}

Object.freeze(SessionDAO) // Singleton
module.exports = SessionDAO
