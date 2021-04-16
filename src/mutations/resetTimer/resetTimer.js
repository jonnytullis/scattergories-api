const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { getDefaultSettings } = require('../../utils/gameHelpers')

const mutation = gql`
    resetTimer: ResetTimerPayload!
`

const typeDefs = gql`
    type ResetTimerPayload {
        success: Boolean
    }
`

const resolver = {
  async resetTimer (_, __, { auth, pubsub, dataSources }) {
    let { game } = auth.authorizeHost()

    if (!game?.timer) {
      throw new ApolloError(`Error locating timer for game: ${game.id}`)
    }

    game.timer.isRunning = false
    game.timer.seconds = game.settings?.timerSeconds || getDefaultSettings().timerSeconds

    try {
      game = await dataSources.GameDAO.updateGame(game.id, {
        timer: game.timer
      })
    } catch(e) {
      throw new ApolloError('Error resetting timer')
    }

    pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

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
