const { ApolloServer } = require('apollo-server')
const { createTestClient } = require('apollo-server-testing')
const { modules, typeDefs, context } = require('../../../prepareServer')
const { CREATE_GAME } = require('./mutations')

const server = new ApolloServer({
  modules,
  typeDefs,
  context
})
const { mutate } = createTestClient(server)

const GameDAO = context.GameDAO

afterAll(() => {
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
