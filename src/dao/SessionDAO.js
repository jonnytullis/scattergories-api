const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const { getUpdatedTTL } = require('../utils/gameHelpers')

const ddb = new AWS.DynamoDB.DocumentClient()

const TableName = process.env.NODE_ENV === 'development' ? 'scattergories-session-dev' : 'scattergories-session-prd'
const GameIdIndex = 'gameId-userId-index'

const SessionDAO = {
  createSession: (userId, gameId) => new Promise((resolve, reject) => {
    const session = {
      id: uuid(),
      userId,
      gameId,
      ttl: getUpdatedTTL()
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
  }),
  getGameSessions: gameId => new Promise((resolve, reject) => {
    const params = {
      TableName,
      IndexName: GameIdIndex,
      KeyConditionExpression: 'gameId = :gameId',
      ExpressionAttributeValues: {
        ':gameId': gameId
      }
    }

    ddb.query(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Items)
    })
  }),
  deleteGameSessions: gameId => new Promise((resolve, reject) => {
    SessionDAO.getGameSessions(gameId).then((gameSessions) => {
      const batchRequests = []
      gameSessions?.forEach((item) => {
        batchRequests.push({
          DeleteRequest: {
            Key: {
              id: item.id
            }
          }
        })
      })

      const params = {
        RequestItems: {
          [TableName]: batchRequests
        }
      }

      ddb.batchWrite(params, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    }).catch((err) => {
      reject(err)
    })
  })
}

Object.freeze(SessionDAO) // Singleton
module.exports = SessionDAO
