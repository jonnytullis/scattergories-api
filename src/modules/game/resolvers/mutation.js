const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')
const subscriptions = require('./subscription')

module.exports.createGame = (_, { hostName, gameName }) => {
  const host = {
    id: generateUserId(),
    name: hostName
  }

  const game = {
    id: generateGameId(),
    letter: getRandomLetter(),
    name: gameName || `${host.name}'s Game`,
    hostId: host.id,
    players: [ host ],
    settings: generateDefaultSettings()
  }

  GameDAO.add(game)
  subscriptions.games.publishGames()

  return {
    game,
    user: host
  }
}

module.exports.joinGame = (_, { gameId, userName }) => {
  const user = {
    id: generateUserId(),
    name: userName
  }

  // Find the game
  const game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError(`Game ID ${gameId} not found`, '404')
  }

  game.players.push(user)
  subscriptions.game.publishGame(gameId)

  return {
    game,
    user
  }
}

module.exports.leaveGame = (gameId, userId) => {
  try {
    GameDAO.removePlayer(gameId, userId)
  } catch(e) {
    throw new ApolloError(e.message, '404')
  }
  subscriptions.game.publishGame(gameId)
  return {
    success: true
  }
}

module.exports.newLetter = async (_, { gameId, userId }) => {
  let game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError(`Game ID ${gameId} not found`, '404')
  }
  if (game.hostId === userId) {
    await GameDAO.setLetter(game.id, getRandomLetter())
    subscriptions.game.publishGames(gameId)
  }
  return {
    letter: game.letter
  }
}

function generateGameId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function generateUserId() {
  return Math.random().toString(36).slice(2)
}

function getRandomLetter() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}

function generateDefaultSettings() {
  return {
    timerSeconds: 180,
    numRounds: 3,
    numPrompts: 12
  }
}