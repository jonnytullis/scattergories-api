const { ValidationError, ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { createUser } = require('../../modules-DEPRECATED/game/helpers')

const mutation = gql`
    joinGame(gameId: String!, userName: String!): JoinGameResponse!
`

const typeDefs = gql`
    type JoinGameResponse {
        gameId: String!
        userId: ID!
        sessionId: ID!
    }
`

const resolver = {
  async joinGame (_, { gameId, userName }, { pubsub, GameDAO, SessionDAO }) {
    let game = await GameDAO.getGame(gameId)
    if (!game) {
      throw new ValidationError(`Game ID ${gameId} does not exist`)
    }

    const user = createUser(userName, game.players?.length)
    const { sessionId } = SessionDAO.createSession(user.id, game.id)
    try {
      game.players = await GameDAO.addPlayer(game.id, user)
    } catch(e) {
      throw new ApolloError('Failed to join game.')
    }

    pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

    return {
      gameId: game.id,
      userId: user.id,
      sessionId
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
