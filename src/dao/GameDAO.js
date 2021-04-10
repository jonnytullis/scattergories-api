const { DynamoDB: ddb } = require('./DynamoDB')

const TableName = process.env.NODE_ENV === 'development' ? 'scattergories-game-dev' : 'scattergories-game'

const GameDAO = {
  addGame: item => new Promise((resolve, reject) => {
    ddb.put({
      TableName,
      Item: item
    }, function(err) {
      if (err) {
        reject(err)
      }
      resolve()
    })
  }),
  // deleteGame: gameId => {
  //   const index = games.findIndex(item => item.id === gameId)
  //   if (index >= 0) {
  //     games.splice(index, 1)
  //   } else {
  //     console.error('Unable to delete game. Game not found:', gameId)
  //   }
  // },
  getGame: gameId => new Promise((resolve, reject) => {
    ddb.get({
      TableName,
      Key: {
        id: gameId
      }
    }, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
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
  // addPlayer: (gameId, player) => {
  //   const game = games.find(game => game.id === gameId)
  //   if (game) {
  //     game.players.push(player)
  //   }
  // },
  // removePlayer: (gameId, userId) => {
  //   // Find the game
  //   const game = games.find(game => game.id === gameId)
  //   if (game) {
  //     // Remove the player from the game player list
  //     const playerIndex = game.players.findIndex(user => user.id === userId)
  //     if (playerIndex >= 0) {
  //       game.players.splice(playerIndex, 1)
  //     }
  //   }
  // },
  // updateSettings: (gameId, settings) => {
  //   const game = games.find(game => game.id === gameId)
  //   if (game) {
  //     game.settings = { ...game.settings, ...settings }
  //   }
  // },
}

module.exports = GameDAO
