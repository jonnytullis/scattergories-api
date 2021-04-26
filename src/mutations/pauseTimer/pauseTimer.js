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

    if (!game?.timer) {
      throw new ApolloError(`Error locating timer for game: ${game.id}`)
    }

    game.timer.isRunning = false
    game.prompts.hidden = true

    let updates
    try {
      updates = await dataSources.GameDAO.updateGame(game.id, {
        timer: game.timer,
        prompts: game.prompts
      })
    } catch(e) {
      console.error(e)
      throw new ApolloError('Error pausing timer')
    }

    pubsub.publish('GAME_UPDATED', { gameUpdated: { updates, gameId: game.id } })

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
