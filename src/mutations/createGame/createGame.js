const { ValidationError, ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { createUser, getDefaultSettings, getRandomLetter, createTimer } = require('../../utils/gameHelpers')
const { getRandomPrompts } = require('../../utils/prompts/prompts')

const mutation = gql`
    createGame(hostName: String!, gameName: String!): CreateGamePayload!
`

const typeDefs = gql`
    type CreateGamePayload {
        gameId: ID!
        userId: ID!
        sessionId: ID!
    }
`

const resolver = {
  async createGame (_, { hostName, gameName }, { dataSources }) {
    if (!hostName || !gameName) {
      throw new ValidationError('"hostName" and "gameName" are required')
    }

    const settings = getDefaultSettings()
    const host = createUser(hostName, 0)

    async function getUniqueGameId() {
      let gameId
      while (!gameId) {
        try {
          gameId = Math.random().toString(36).slice(2, 8).toUpperCase()
          const game = await dataSources.GameDAO.getGame(gameId)
          if (game) {
            // A game already has that ID
            gameId = undefined
          }
        } catch(e) {
          console.error(e)
          throw new ApolloError('Could not verify unique Game ID')
        }
      }
      return gameId
    }

    const game = {
      id: await getUniqueGameId(),
      name: gameName || `${host.name}'s Game`,
      hostId: host.id,
      players: [ host ],
      letter: getRandomLetter(),
      prompts: {
        hidden: true,
        list: getRandomPrompts(settings.numPrompts)
      },
      settings,
      timer: createTimer(settings.timerSeconds)
    }

    let session
    try {
      await dataSources.GameDAO.putGame(game)
      session = await dataSources.SessionDAO.createSession(host.id, game.id)
    } catch(e) {
      console.error(e)
      throw new ApolloError('Failed to create game.')
    }

    return {
      gameId: game.id,
      userId: host.id,
      sessionId: session.id
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
