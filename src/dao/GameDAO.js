const games = [] // FIXME this will eventually be a database

const GameDAO = {
    add: item => games.push(item),
    get: id => games.find(game => game.id === id),
    getAll: () => JSON.parse(JSON.stringify(games))
}

Object.freeze(GameDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = GameDAO