const { ApolloServer } = require('apollo-server')
const { createTestClient } = require('apollo-server-testing')
const { modules, typeDefs, context } = require('../../../prepareServer')
const { CREATE_GAME, JOIN_GAME, LEAVE_GAME } = require('./mutations')
const { GAME } = require('./queries')

const server = new ApolloServer({
  modules,
  typeDefs,
  context
})
const { mutate, query } = createTestClient(server)

const { GameDAO } = context

const getMockGame = () => ({
  id: 'ABCDEF',
  name: 'Jonny\'s Game',
  hostId: '123456789',
  players: [ {
    id: '123456789',
    name: 'Jonny'
  } ],
  letter: 'A',
  settings: {
    timerSeconds: 180,
    numRounds: 3,
    numPrompts: 3
  }
})

afterEach(() => {
  GameDAO.clear()
})

test('Create Game', async () => {
  const hostName = 'Jonny Boy'
  const gameName = 'Jonny\'s Game'
  const result = await mutate({
    mutation: CREATE_GAME,
    variables: { hostName, gameName }
  })

  const resultData = result?.data?.createGame

  expect(resultData?.gameId).toHaveLength(6)
  expect(resultData?.userId).toBeDefined()

  const game = GameDAO.get(resultData?.gameId)

  expect(game.id).toEqual(resultData?.gameId)
  expect(game.name).toEqual(gameName)
  expect(game.hostId).toEqual(resultData?.userId)
  expect(game.players).toEqual([ { id: resultData?.userId, name: hostName } ])
  expect(game.letter).toBeDefined()
  expect(game.settings).toBeDefined()
})

test('Join Game', async () => {
  const mockGame = getMockGame()
  GameDAO.add(mockGame)

  const userName = 'Captain America'
  const result = await mutate({
    mutation: JOIN_GAME,
    variables: { gameId: mockGame.id, userName }
  })

  const resultData = result?.data?.joinGame

  // Make sure the joinGamePayload is correct
  expect(resultData.gameId).toEqual(mockGame.id)
  expect(resultData.userId).toBeDefined()

  // Make sure the new user is listed as a player in the game in the DB
  const game = GameDAO.get(mockGame.id)
  expect(game?.players).toHaveLength(2)
  expect(game?.players).toContainEqual({ id: resultData.userId, name: userName })

  // Check if user tries to join game that doesn't exist
  const notFoundResult = await mutate({
    mutation: JOIN_GAME,
    variables: { gameId: 'NOT-VALID', userName }
  })

  expect(notFoundResult?.errors?.[0]?.message?.toLowerCase()).toContain('not found')
})

test('Get Game', async () => {
  const mockGame = getMockGame()
  const mockHost = mockGame.players[0]
  GameDAO.add(mockGame)

  const result = await query({
    query: GAME,
    variables: { gameId: mockGame.id, userId: mockHost.id }
  })

  const badUserResult = await query({
    query: GAME,
    variables: { gameId: mockGame.id, userId: 'Not a player ID' }
  })

  const notFoundResult = await query({
    query: GAME,
    variables: { gameId: 'NOT-VALID', userId: mockHost.id }
  })

  expect(result?.data?.game).toEqual(mockGame)
  expect(badUserResult?.errors?.[0].message?.toLowerCase()).toContain('unauthorized')
  expect(notFoundResult?.errors?.[0].message?.toLowerCase()).toContain('not found')
})

test('Leave Game', async () => {
  const mockGame = getMockGame()
  const mockHost = mockGame.players[0]
  const player1 = {
    id: 'abc123456',
    name: 'Captain America'
  }
  const player2 = {
    id: 'pql4kt9d3',
    name: 'Charles Schwab'
  }
  mockGame.players.push(player1)
  mockGame.players.push(player2)

  GameDAO.add(mockGame)

  let result = await mutate({
    mutation: LEAVE_GAME,
    variables: { gameId: mockGame.id, userId: 'NOT-VALID' }
  })

  // Player ID should not be found
  expect(result?.errors?.[0]?.message?.toLowerCase()).toContain('not found')

  result = await mutate({
    mutation: LEAVE_GAME,
    variables: { gameId: 'NOT-VALID', userId: player2.id }
  })

  // Game should not be found
  expect(result?.errors?.[0]?.message?.toLowerCase()).toContain('not found')

  result = await mutate({
    mutation: LEAVE_GAME,
    variables: { gameId: mockGame.id, userId: player2.id }
  })

  // Should have been successfull
  expect(result?.data?.leaveGame?.success).toEqual(true)

  let game = GameDAO.get(mockGame.id)

  // Host and player1 should still be in the game
  expect(game?.players).toHaveLength(2)
  expect(game?.players).toContainEqual(mockHost)
  expect(game?.players).toContainEqual(player1)

  result = await mutate({
    mutation: LEAVE_GAME,
    variables: { gameId: mockGame.id, userId: mockHost.id }
  })

  // Game should be deleted if host leaves
  expect(result?.data?.leaveGame?.success).toEqual(true)
  expect(GameDAO.get(mockGame.id)).toBeUndefined()
})
