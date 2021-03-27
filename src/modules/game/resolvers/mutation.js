const { UserInputError } = require('apollo-server')
const { createUser, generateGameId, generateDefaultSettings, getRandomLetter, getValidGame } = require('../helpers')

module.exports.createGame = (_, { hostName, gameName }, { GameDAO, PromptsDAO, AuthTokenDAO, TimerDAO }) => {
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

  TimerDAO.add(game.id, game.settings?.timerSeconds || 180)

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

module.exports.endGame = async (_, __, { auth, pubsub, AuthTokenDAO, GameDAO, TimerDAO }) => {
  const { game } = auth.authorizeHost()

  const status = { gameId: game.id, message: 'Game ended by host', ended: true }
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { status } })

  // Delete the game and data associated with the user
  GameDAO.delete(game.id)
  AuthTokenDAO.delete(auth.sessionId)
  TimerDAO.delete(game.id)
}

module.exports.leaveGame = async (_, __, { auth, pubsub, AuthTokenDAO, GameDAO }) => {
  let { game, user } = auth.authorizeUser()

  // Delete data associated with the user
  GameDAO.removePlayer(game.id, user.id)
  AuthTokenDAO.delete(auth.sessionId)

  // Get the updated game before publishing
  game = GameDAO.get(game.id)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

  return {
    success: true
  }
}

module.exports.newLetter = async (_, __, { pubsub, auth, GameDAO }) => {
  let { game } = auth.authorizeHost()

  // Don't allow the same letter as before
  let newLetter = getRandomLetter()
  while (newLetter === game.letter) {
    newLetter = getRandomLetter()
  }

  GameDAO.setLetter(game.id, newLetter)
  game = GameDAO.get(game.id)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

  return {
    letter: game.letter
  }
}

module.exports.newPrompts = async (_, __, { auth, pubsub, GameDAO, PromptsDAO }) => {
  let { game } = auth.authorizeHost()

  const prompts = PromptsDAO.getRandomPrompts(game.settings?.numPrompts)
  GameDAO.setPrompts(game.id, prompts)
  game = GameDAO.get(game.id)
  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

  return {
    prompts
  }
}

module.exports.updateSettings = async (_, { settings }, { auth, pubsub, GameDAO }) => {
  let { game } = auth.authorizeHost()

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

  GameDAO.updateSettings(game.id, newSettings)
  game = GameDAO.get(game.id)

  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  return game.settings
}
