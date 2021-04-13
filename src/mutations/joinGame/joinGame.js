const { ValidationError, ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { createUser } = require('../../helpers/gameHelpers')

const mutation = gql`
    joinGame(gameId: String!, userName: String!): JoinGamePayload!
`

const typeDefs = gql`
    type JoinGamePayload {
        gameId: String!
        userId: ID!
        sessionId: ID!
    }
`

const resolver = {
  async joinGame (_, { gameId, userName }, { pubsub, dataSources }) {
    // TODO: enforce max 20 players
    let game = await dataSources.GameDAO.getGame(gameId)
    if (!game) {
      throw new ValidationError(`Game ID ${gameId} does not exist`)
    }

    const user = createUser(userName, game.players?.length)
    const session = await dataSources.SessionDAO.createSession(user.id, game.id)
    try {
      game.players = await dataSources.GameDAO.addPlayer(game.id, user)
    } catch(e) {
      throw new ApolloError('Failed to join game.')
    }

    pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

    return {
      gameId: game.id,
      userId: user.id,
      sessionId: session.id
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
