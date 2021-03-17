const games = [] // FIXME this will eventually be a database. Make GameDAO a class.

const GameDAO = {
  add: item => games.push(item),
  clear: () => { games.splice(0, games.length) },
  delete: gameId => {
    const index = games.findIndex(item => item.id === gameId)
    if (index < 0) {
      throw new Error(`Game ID ${gameId} not found`)
    }
    games.splice(index, 1)
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
    if (!game) {
      throw new Error(`Game ID ${gameId} not found`)
    }

    // Remove the player from the game player list
    const playerIndex = game.players.findIndex(user => user.id === userId)
    if (playerIndex < 0) {
      throw new Error(`Player with ID ${userId} not found in Game with ID ${gameId}`)
    }
    game.players.splice(playerIndex, 1)
  },
}

Object.freeze(GameDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = GameDAO
