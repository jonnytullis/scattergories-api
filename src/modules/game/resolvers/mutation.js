const { ApolloError } = require('apollo-server')

const { timer: timerSubscriptions } = require('../../timer/resolvers/subscription')
const { generateUserId, generateGameId, generateDefaultSettings, getRandomLetter } = require('../helpers')

module.exports.createGame = (_, { hostName, gameName }, { pubsub, GameDAO, PromptsDAO }) => {
  const host = {
    id: generateUserId(),
    name: hostName
  }

  const gameId = generateGameId()
  const game = {
    id: gameId,
    name: gameName || `${host.name}'s Game`,
    hostId: host.id,
    players: [ host ],
    letter: getRandomLetter(),
    prompts: [],
    settings: generateDefaultSettings(),
  }

  game.prompts = PromptsDAO.getRandomPrompts(game.settings.numPrompts)

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

  // Don't allow the same letter as before
  let newLetter = getRandomLetter()
  while (newLetter === game.letter) {
    newLetter = getRandomLetter()
  }

  GameDAO.setLetter(game.id, newLetter)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  return {
    letter: game.letter
  }
}

module.exports.newPrompts = async (_, { gameId, userId }, { pubsub, GameDAO, PromptsDAO }) => {
  let game = GameDAO.get(gameId)
  if (!game) {
    throw new ApolloError(`Game ID ${gameId} not found`, '404')
  }
  if (game.hostId !== userId) {
    throw new ApolloError(`Unauthorized. Must be host to update game.`, '403')
  }

  const prompts = PromptsDAO.getRandomPrompts(game.settings?.numPrompts)
  GameDAO.setPrompts(gameId, prompts)
  game = GameDAO.get(gameId)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

  return {
    prompts
  }
}
