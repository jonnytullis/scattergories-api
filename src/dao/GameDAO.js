const { DynamoDB: ddb } = require('./DynamoDB')

const TableName = process.env.NODE_ENV === 'development' ? 'scattergories-game-dev' : 'scattergories-game-prd'

const GameDAO = {
  putGame: item => new Promise((resolve, reject) => {
    const params = {
      TableName,
      Item: item
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
  updateLetter: (gameId, letter) => new Promise((resolve, reject) => {
    if (typeof letter !== 'string') {
      throw new Error('Letter must be of type string')
    }

    const params = {
      TableName,
      Key: {
        id: gameId
      },
      UpdateExpression: 'SET letter = :letter',
      ExpressionAttributeValues: {
        ':letter': letter
      },
      ReturnValued: 'UPDATED_NEW'
    }

    ddb.update(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Attributes?.letter)
    })
  }),
  updatePrompts: (gameId, prompts) => new Promise((resolve, reject) => {
    if (!Array.isArray(prompts)) {
      throw new Error('Prompts must be of type array')
    }

    const params = {
      TableName,
      Key: {
        id: gameId
      },
      UpdateExpression: 'SET prompts = :prompts',
      ExpressionAttributeValues: {
        ':prompts': prompts
      },
      ReturnValued: 'UPDATED_NEW'
    }

    ddb.update(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data?.Attributes?.prompts)
    })
  })
  // updateSettings: (gameId, settings) => {
  //   const game = games.find(game => game.id === gameId)
  //   if (game) {
  //     game.settings = { ...game.settings, ...settings }
  //   }
  // },
}

Object.freeze(GameDAO) // Singleton
module.exports = GameDAO
