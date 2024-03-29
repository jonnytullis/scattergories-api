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

    if (!game?.timer) {
      throw new ApolloError(`Error locating timer for game: ${game.id}`)
    }

    game.timer.isRunning = true
    game.prompts.hidden = false

    let updates
    try {
      updates = await dataSources.GameDAO.updateGame(game.id, {
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
        if (updates.timer.seconds > 0) {
          updates.timer = await dataSources.GameDAO.decrementRunningTimer(game.id)
        } else {
          clearInterval(interval)
          updates.timer.isRunning = false
          await dataSources.GameDAO.updateGame(game.id, {
            timer: updates.timer
          })
        }
        pubsub.publish('GAME_UPDATED', { gameUpdated: { updates, gameId: game.id } })
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
