const root = require('./root')
const Game = require('./types/Game')
const User = require('./types/User')

const schemaArray = [
    root,
    Game,
    User
]

module.exports = schemaArray