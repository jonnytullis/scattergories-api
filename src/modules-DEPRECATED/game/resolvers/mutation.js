const { UserInputError, ApolloError, ValidationError } = require('apollo-server')
const { createUser, generateGameId, getDefaultSettings, getRandomLetter } = require('../helpers')

// module.exports.createGame = async (_, { hostName, gameName }, { GameDAO, PromptsDAO, SessionDAO, TimerDAO }) => {
//   if (!hostName || !gameName) {
//     throw new ValidationError('"Name" and "Game Name" are required fields.')
//   }
//
//   const host = createUser(hostName, 0)
//   const gameId = generateGameId()
//   const game = {
//     id: gameId,
//     name: gameName || `${host.name}'s Game`,
//     hostId: host.id,
//     players: [ host ],
//     letter: getRandomLetter(),
//     prompts: [],
//     settings: getDefaultSettings(),
//   }
//
//   game.prompts = PromptsDAO.getRandomPrompts(game.settings.numPrompts)
//
//   let session
//   try {
//     await GameDAO.addGame(game)
//     session = await SessionDAO.createSession(host.id, game.id)
//   } catch(e) {
//     throw new Error('Failed to create game.')
//   }
//
//   TimerDAO.add(game.id, game.settings.timerSeconds)
//
//   return {
//     gameId: game.id,
//     userId: host.id,
//     sessionId: session.id
//   }
// }

// module.exports.joinGame = (_, { gameId, userName }, { pubsub, GameDAO, SessionDAO }) => {
//   let game = GameDAO.get(gameId)
//   if (!game) {
//     throw new ApolloError(`Game ID ${gameId} not found`)
//   }
//
//   const user = createUser(userName, game.players?.length)
//   const { sessionId } = SessionDAO.add(user.id, game.id)
//   GameDAO.addPlayer(game.id, user)
//
//   game = GameDAO.get(game.id)
//   pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
//
//   return {
//     gameId: game.id,
//     userId: user.id,
//     sessionId
//   }
// }

module.exports.leaveGame = async (_, __, { auth, pubsub, SessionDAO, GameDAO, TimerDAO }) => {
  let { game, user } = auth.authorizeUser()
  const isHost = auth.isUserHost()

  if (isHost) {
    // Delete the game and data associated with the user
    GameDAO.delete(game.id)
    TimerDAO.delete(game.id)

    const status = { gameId: game.id, message: 'Game ended by host', ended: true }
    await pubsub.publish('GAME_UPDATED', { gameUpdated: { status } })
  } else {
    // Delete data associated with the user
    GameDAO.removePlayer(game.id, user.id)

    // Get the updated game before publishing
    game = GameDAO.get(game.id)
    await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  }

  SessionDAO.delete(auth.sessionId)

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

  if (typeof settings !== 'object') {
    throw new UserInputError('Settings must be type object')
  }

  const { timerSeconds, numPrompts } = { ...settings }
  if (Number(timerSeconds) < 30) {
    throw new UserInputError('Timer length must be 30 seconds or more')
  }
  if (Number(numPrompts) < 1) {
    throw new UserInputError('Number of prompts must be greater than 1')
  }

  GameDAO.updateSettings(game.id, { timerSeconds, numPrompts })
  game = GameDAO.get(game.id)

  await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
  return game.settings
}
