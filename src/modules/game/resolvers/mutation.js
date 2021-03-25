const { ApolloError, UserInputError } = require('apollo-server')
const { timer: timerSubscriptions } = require('../../timer/resolvers/subscription')
const { createUser, generateGameId, generateDefaultSettings, getRandomLetter, getValidGame, mustBeHost } = require('../helpers')

module.exports.createGame = (_, { hostName, gameName }, { GameDAO, PromptsDAO, AuthTokenDAO }) => {
  const host = createUser(hostName, 0)
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
  const { sessionId } = AuthTokenDAO.add(host.id, game.id)

  return {
    gameId: game.id,
    userId: host.id,
    sessionId
  }
}

module.exports.joinGame = (_, { gameId, userName }, { pubsub, GameDAO, AuthTokenDAO }) => {
  const game = getValidGame(gameId, GameDAO)
  const user = createUser(userName, game.players?.length)

  const { sessionId } = AuthTokenDAO.add(user.id, game.id)
  game.players.push(user)
  pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

  return {
    gameId: game.id,
    userId: user.id,
    sessionId
  }
}

module.exports.leaveGame = (_, { gameId, userId }, { pubsub, GameDAO }) => {
  const game = getValidGame(gameId, GameDAO)
  if (game?.hostId === userId) {
    GameDAO.delete(gameId)
    timerSubscriptions.deleteTimer(gameId)
    const status = { gameId, message: 'Game ended by host', ended: true }
    pubsub.publish('GAME_UPDATED', { gameUpdated: { status } })
  } else {
    if (!game.players.some((el) => el.id === userId)) {
      throw new ApolloError('Player not found in game', '404')
    }
    GameDAO.removePlayer(gameId, userId)
    pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  }
  return {
    success: true
  }
}

module.exports.newLetter = async (_, { gameId, userId }, { pubsub, GameDAO }) => {
  let game = getValidGame(gameId, GameDAO)
  mustBeHost(gameId, userId, GameDAO)

  // Don't allow the same letter as before
  let newLetter = getRandomLetter()
  while (newLetter === game.letter) {
    newLetter = getRandomLetter()
  }

  GameDAO.setLetter(game.id, newLetter)
  game = GameDAO.get(gameId)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  return {
    letter: game.letter
  }
}

module.exports.newPrompts = async (_, { gameId, userId }, { pubsub, GameDAO, PromptsDAO }) => {
  let game = getValidGame(gameId, GameDAO)
  mustBeHost(gameId, userId, GameDAO)

  const prompts = PromptsDAO.getRandomPrompts(game.settings?.numPrompts)
  GameDAO.setPrompts(gameId, prompts)
  game = GameDAO.get(gameId)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

  return {
    prompts
  }
}

module.exports.updateSettings = async (_, { gameId, userId, settings }, { pubsub, GameDAO }) => {
  mustBeHost(gameId, userId, GameDAO)

  const newSettings = { ...settings }
  if (Number(settings.timerSeconds) < 30) {
    throw new UserInputError('Timer length must be 30 seconds or more')
  }
  if (Number(settings.numRounds) < 1) {
    throw new UserInputError('Number of rounds must be greater than 1')
  }
  if (Number(settings.numPrompts) < 1) {
    throw new UserInputError('Number of prompts must be greater than 1')
  }
  GameDAO.updateSettings(gameId, newSettings)

  let game = getValidGame(gameId, GameDAO)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  return game.settings
}
