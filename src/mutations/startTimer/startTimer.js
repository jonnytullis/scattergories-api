const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')

const mutation = gql`
    startTimer: StartTimerPayload!
`

const typeDefs = gql`
    type StartTimerPayload {
        success: Boolean
    }
`

const resolver = {
  async startTimer (_, __, { auth, pubsub, dataSources }) {
    const { game } = auth.authorizeHost()

    if (!game.timer) {
      throw new ApolloError(`Error starting timer for game: ${game.id}`)
    }

    try {
      game.timer.isRunning = true
      await dataSources.GameDAO.updateGame(game.id, 'timer', game.timer)

      const interval = setInterval(async () => {
        if (game.timer.seconds > 0 && game.timer.isRunning) {
          game.timer = await dataSources.GameDAO.decrementRunningTimer(game.id)
        } else {
          clearInterval(interval)
        }

        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      }, 1000)
    } catch(e) {
      throw new ApolloError('Timer error')
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
