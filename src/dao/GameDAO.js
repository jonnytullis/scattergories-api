const games = [] // FIXME this will eventually be a database. Make GameDAO a class.

const GameDAO = {
  add: item => games.push(item),
  delete: gameId => {
    const index = games.findIndex(item => item.id === gameId)
    if (index >= 0) {
      games.splice(index, 1)
    } else {
      console.error('Unable to delete game. Game not found:', gameId)
    }
  },
  get: gameId => games.find(game => game.id === gameId),
  getAll: () => JSON.parse(JSON.stringify(games)),
  setLetter: (gameId, value) => {
    const game = games.find(game => game.id === gameId)
    if (game) {
      game.letter = value
    }
  },
  setPrompts: (gameId, value) => {
    if (!Array.isArray(value)) {
      throw new Error('Prompts value must be an array')
    }
    const game = games.find(game => game.id === gameId)
    if (game) {
      game.prompts = value
    }
  },
  removePlayer: (gameId, userId) => {
    // Find the game
    const game = games.find(game => game.id === gameId)
    if (game) {
      // Remove the player from the game player list
      const playerIndex = game.players.findIndex(user => user.id === userId)
      if (playerIndex >= 0) {
        game.players.splice(playerIndex, 1)
      }
    }
  },
  updateSettings: (gameId, settings) => {
    const game = games.find(game => game.id === gameId)
    if (game) {
      game.settings = { ...game.settings, ...settings }
    }
  },
}

Object.freeze(GameDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = GameDAO
