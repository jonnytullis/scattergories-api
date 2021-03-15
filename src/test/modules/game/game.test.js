const { createTestClient } = require('apollo-server-testing')
const server = require('../../../prepareServer')
const { CREATE_GAME } = require('./gql')

const { mutate } = createTestClient(server)

test('Create Game', async () => {
  const result = await mutate({
    mutation: CREATE_GAME,
    variables: { hostName: 'Jonny Boy', gameName: 'Jonny\'s Game' }
  })
  const data = result?.data?.createGame
  expect(data?.gameId).toHaveLength(6)
  expect(data?.userId).toBeDefined()
})
