const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')

const mutation = gql`
    pauseTimer: PauseTimerPayload!
`

const typeDefs = gql`
    type PauseTimerPayload {
        success: Boolean
    }
`

const resolver = {
  async pauseTimer (_, __, { auth, pubsub, dataSources }) {
    const { game } = auth.authorizeHost()

    if (!game) {
      throw new ApolloError(`Error starting timer for game: ${game.id}`)
    }

    try {
      game.timer.isRunning = false
      await dataSources.GameDAO.updateGame(game.id, 'timer', game.timer)
      pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
    } catch(e) {
      throw new ApolloError('Error pausing timer')
    }

    return {
      success: true
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
