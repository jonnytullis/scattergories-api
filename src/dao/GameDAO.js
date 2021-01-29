const games = [] // FIXME this will eventually be a database

const GameDAO = {
    add: item => games.push(item),
    get: id => games.find(game => game.id === id),
    getAll: () => JSON.parse(JSON.stringify(games)),
    setLetter: (gameId, value) => {
        const game = games.find(game => game.id === gameId)
        if (game) {
            game.letter = value
        }
        return game
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
    getPrompts: () => require('./prompts.json'),
}

Object.freeze(GameDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = GameDAO