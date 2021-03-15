const { ApolloError } = require('apollo-server')
const { timer: timerSubscriptions } = require('../../timer/resolvers/subscription')

module.exports.createGame = (_, { hostName, gameName }, { pubsub, GameDAO }) => {
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
    settings: generateDefaultSettings(),
  }

  GameDAO.add(game)
  pubsub.publish('GAME_CREATED', { games: GameDAO.getAll() })

  return {
    gameId: game.id,
    userId: host.id
  }
}

module.exports.joinGame = (_, { gameId, userName }, { pubsub, GameDAO }) => {
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
  pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

  return {
    gameId: game.id,
    userId: user.id
  }
}

module.exports.leaveGame = (_, { gameId, userId }, { pubsub, GameDAO }) => {
  const game = GameDAO.get(gameId)
  if (game?.hostId === userId) {
    GameDAO.delete(gameId)
    timerSubscriptions.deleteTimer(gameId)
    const status = { gameId, message: 'Game ended by host' }
    pubsub.publish('GAME_UPDATED', { gameUpdated: { status } })
  } else {
    GameDAO.removePlayer(gameId, userId)
    pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  }
  return {
    success: true
  }
}

module.exports.newLetter = async (_, { gameId, userId }, { pubsub, GameDAO }) => {
  let game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError(`Game ID ${gameId} not found`, '404')
  }
  if (game.hostId !== userId) {
    throw new ApolloError(`Unauthorized. Must be host to update game.`, '403')
  }

  await GameDAO.setLetter(game.id, getRandomLetter())
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
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
