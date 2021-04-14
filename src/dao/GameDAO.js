const { DynamoDB: ddb } = require('./DynamoDB')

const TableName = process.env.NODE_ENV === 'development' ? 'scattergories-game-dev' : 'scattergories-game-prd'

const GameDAO = {
  putGame: item => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Item: { ...item, timestamp: new Date().toISOString() }
    }

    ddb.put(params, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  }),
  deleteGame: gameId => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Key: {
        id: gameId
      }
    }

    ddb.delete(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Item)
    })
  }),
  getGame: gameId => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Key: {
        id: gameId
      }
    }

    ddb.get(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Item)
    })
  }),
  addPlayer: (gameId, player) => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Key: {
        id: gameId
      },
      UpdateExpression: 'SET players = list_append(players, :newPlayers)',
      ExpressionAttributeValues: {
        ':newPlayers': [ player ]
      },
      ReturnValues: 'UPDATED_NEW'
    }

    ddb.update(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Attributes?.players)
    })
  }),
  removePlayer: (gameId, playerIndex) => new Promise((resolve, reject) => {
    if (!playerIndex) {
      throw new Error('Invalid player index')
    }

    const params = {
      TableName,
      Key: {
        id: gameId
      },
      UpdateExpression: `REMOVE players[${playerIndex}]`,
      ReturnValues: 'ALL_NEW'
    }

    ddb.update(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Attributes?.players)
    })
  }),
  updateGame: (gameId, propName, value) => new Promise((resolve, reject) => {
    if (typeof propName !== 'string' || !value) {
      throw new Error('Invalid propName or value')
    }

    const params = {
      TableName,
      Key: {
        id: gameId
      },
      UpdateExpression: `SET ${propName} = :value`,
      ExpressionAttributeValues: {
        ':value': value
      },
      ReturnValues: 'UPDATED_NEW'
    }

    ddb.update(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Attributes?.[propName])
    })
  }),
  // Only decrements the timer if it is running
  decrementRunningTimer: gameId => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Key: {
        id: gameId
      },
      UpdateExpression: `SET timer.seconds = timer.seconds - :num`,
      ConditionExpression: 'timer.isRunning = :isRunning',
      ExpressionAttributeValues: {
        ':num': 1,
        ':isRunning': true
      },
      ReturnValues: 'ALL_NEW'
    }

    ddb.update(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Attributes?.timer)
    })
  })
}

Object.freeze(GameDAO) // Singleton
module.exports = GameDAO
