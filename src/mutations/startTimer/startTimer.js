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
    let { game } = auth.authorizeHost()

    if (!game?.timer) {
      throw new ApolloError(`Error locating timer for game: ${game.id}`)
    }

    game.timer.isRunning = true
    game.prompts.hidden = false

    try {
      game = await dataSources.GameDAO.updateGame(game.id, {
        timer: game.timer,
        prompts: game.prompts
      })
    } catch(e) {
      console.error(e)
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
          game.timer.isRunning = false
          await dataSources.GameDAO.updateGame(game.id, {
            timer: game.timer
          })
        }
        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      } catch(e) {
        if (e.code === 'ConditionalCheckFailedException') {
          // This means that the timer in the database was set to { isRunning: false } which happens when paused or reset
          clearInterval(interval)
        } else {
          console.error(e)
          throw new ApolloError('Error with the timer')
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
