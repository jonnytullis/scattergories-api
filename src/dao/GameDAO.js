const { DynamoDB: ddb } = require('./DynamoDB')

const TableName = process.env.NODE_ENV === 'development' ? 'scattergories-game-dev' : 'scattergories-game-prd'

const GameDAO = {
  addGame: item => new Promise((resolve, reject) => {
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
      key: {
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
  // getAll: () => JSON.parse(JSON.stringify(games)),
  // setLetter: (gameId, value) => {
  //   const game = games.find(game => game.id === gameId)
  //   if (game) {
  //     game.letter = value
  //   }
  // },
  // setPrompts: (gameId, value) => {
  //   if (!Array.isArray(value)) {
  //     throw new Error('Prompts value must be an array')
  //   }
  //   const game = games.find(game => game.id === gameId)
  //   if (game) {
  //     game.prompts = value
  //   }
  // },
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
  // updateSettings: (gameId, settings) => {
  //   const game = games.find(game => game.id === gameId)
  //   if (game) {
  //     game.settings = { ...game.settings, ...settings }
  //   }
  // },
}

Object.freeze(GameDAO) // Singleton
module.exports = GameDAO
