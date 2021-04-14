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

    game.timer.isRunning = true
    try {
      await dataSources.GameDAO.updateGame(game.id, 'timer', game.timer)
    } catch(e) {
      throw new ApolloError('Error starting timer')
    }

    let interval
    await decrementTimer()
    interval = setInterval(async () => {
      await decrementTimer()
    }, 1000)

    async function decrementTimer () {
      try {
        if (game.timer.seconds > 0) {
          game.timer = await dataSources.GameDAO.decrementRunningTimer(game.id)
        } else {
          clearInterval(interval)
        }
        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      } catch(e) {
        if (e.code === 'ConditionalCheckFailedException') {
          // This means that the timer in the database was set to { isRunning: false } which happens when paused
          clearInterval(interval)
        } else {
          const status = {
            gameId: game.id,
            ended: false,
            message: 'Something went wrong with the timer...'
          }
          await pubsub.publish('GAME_UPDATED', { gameUpdated: { status } })
        }
      }
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
