const { ApolloServer } = require('apollo-server')
const { createTestClient } = require('apollo-server-testing')
const { modules, typeDefs, context } = require('../../../prepareServer')
const { CREATE_GAME, JOIN_GAME } = require('./mutations')
const { GAME } = require('./queries')

const server = new ApolloServer({
  modules,
  typeDefs,
  context
})
const { mutate, query } = createTestClient(server)

const { GameDAO } = context

const mockHost = {
  id: '123456789',
  name: 'Jonny'
}
const mockGame = {
  id: 'ABCDEF',
  name: 'Jonny\'s Game',
  hostId: mockHost.id,
  players: [ mockHost ],
  letter: 'A',
  settings: {
    timerSeconds: 180,
    numRounds: 3,
    numPrompts: 3
  }
}

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
  GameDAO.add(mockGame)

  const result = await query({
    mutation: GAME,
    variables: { gameId: mockGame.id, userId: mockHost.id }
  })

  const badUserResult = await query({
    mutation: GAME,
    variables: { gameId: mockGame.id, userId: 'Not a player ID' }
  })

  const notFoundResult = await query({
    mutation: GAME,
    variables: { gameId: 'NOT-VALID', userId: mockHost.id }
  })

  expect(result?.data?.game).toEqual(mockGame)
  expect(badUserResult?.errors?.[0].message?.toLowerCase()).toContain('unauthorized')
  expect(notFoundResult?.errors?.[0].message?.toLowerCase()).toContain('not found')
})
