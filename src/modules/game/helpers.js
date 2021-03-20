const { ApolloError } = require('apollo-server')

module.exports.generateGameId = function () {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

module.exports.getRandomLetter = function () {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}

module.exports.generateDefaultSettings = function () {
  return {
    timerSeconds: 180,
    numRounds: 3,
    numPrompts: 12
  }
}

module.exports.getValidGame = function (gameId, GameDAO) {
  let game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError(`Game ID ${gameId} not found`, '404')
  }
  return game
}

module.exports.mustBeHost = function (gameId, userId, GameDAO) {
  let game = GameDAO.get(gameId)
  if (game?.hostId !== userId) {
    throw new ApolloError(`Unauthorized. Must be host to update game.`, '403')
  }
}

function generateUserId () {
  return Math.random().toString(36).slice(2)
}

const colors = [
  '#c70039',
  '#11698e',
  '#fdb827',
  '#00af91',
  '#eb5e0b',
  '#91684a',
  '#007944',
  '#6155a6',
  '#790c5a',
  '#7e7474'
]

module.exports.createUser = function (name, numPlayers = 0) {
  return {
    id: generateUserId(),
    name: name,
    color: colors[numPlayers % colors.length] // Cycle through avatar colors
  }
}
