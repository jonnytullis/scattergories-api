const { ValidationError, ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { createUser, generateGameId, getDefaultSettings, getRandomLetter } = require('../../modules-DEPRECATED/game/helpers')

const mutation = gql`
    createGame(hostName: String!, gameName: String!): CreateGamePayload!
`

const typeDefs = gql`
    type CreateGamePayload {
        gameId: String!
        userId: ID!
        sessionId: ID!
    }
`

const resolver = {
  async createGame (_, { hostName, gameName }, { dataSources }) {
    if (!hostName || !gameName) {
      throw new ValidationError('"hostName" and "gameName" are required fields.')
    }

    const host = createUser(hostName, 0)
    const gameId = generateGameId()
    const game = {
      id: gameId,
      name: gameName || `${host.name}'s Game`,
      hostId: host.id,
      players: [ host ],
      letter: getRandomLetter(),
      prompts: [],
      settings: getDefaultSettings(),
    }

    game.prompts = dataSources.PromptsDAO.getRandomPrompts(game.settings.numPrompts)

    let session
    try {
      await dataSources.GameDAO.putGame(game)
      session = await dataSources.SessionDAO.createSession(host.id, game.id)
    } catch(e) {
      throw new ApolloError('Failed to create game.')
    }

    dataSources.TimerDAO.add(game.id, game.settings.timerSeconds)

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
