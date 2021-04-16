const { ValidationError, ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { createUser, generateGameId, getDefaultSettings, getRandomLetter, createTimer } = require('../../utils/gameHelpers')
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

    const game = {
      id: generateGameId(),
      name: gameName || `${host.name}'s Game`,
      hostId: host.id,
      players: [ host ],
      letter: getRandomLetter(),
      prompts: {
        hidden: true,
        list: getRandomPrompts(settings.numPrompts)
      },
      settings,
      timer: createTimer(settings.timerSeconds),
      timestamp: new Date().toISOString() // Internal use only
    }

    let session
    try {
      await dataSources.GameDAO.putGame(game)
      session = await dataSources.SessionDAO.createSession(host.id, game.id)
    } catch(e) {
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
