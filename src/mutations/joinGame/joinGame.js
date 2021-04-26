const { ValidationError, ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { createUser } = require('../../utils/gameHelpers')

const mutation = gql`
    joinGame(gameId: ID!, userName: String!): JoinGamePayload!
`

const typeDefs = gql`
    type JoinGamePayload {
        gameId: ID!
        userId: ID!
        sessionId: ID!
    }
`

const resolver = {
  async joinGame (_, { gameId, userName }, { pubsub, dataSources }) {
    // TODO: enforce max 20 players
    const game = await dataSources.GameDAO.getGame(gameId)
    if (!game) {
      throw new ValidationError(`Game ID ${gameId} does not exist`)
    }

    const user = createUser(userName, game.players?.length)
    const session = await dataSources.SessionDAO.createSession(user.id, game.id)
    let updates
    try {
      updates = { players: await dataSources.GameDAO.addPlayer(game.id, user) }
    } catch(e) {
      console.error(e)
      throw new ApolloError('Failed to join game.')
    }

    const status = {
      gameId: game.id,
      message: `${userName} joined the game`
    }

    pubsub.publish('GAME_UPDATED', { gameUpdated: { updates, status, gameId: game.id } })

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
