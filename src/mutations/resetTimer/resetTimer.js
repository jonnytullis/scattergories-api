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
    const { game } = auth.authorizeHost()

    if (!game?.timer) {
      throw new ApolloError(`Error locating timer for game: ${game.id}`)
    }

    game.timer.isRunning = false
    game.timer.seconds = game.settings?.timerSeconds || getDefaultSettings().timerSeconds

    let updates
    try {
      updates = await dataSources.GameDAO.updateGame(game.id, {
        timer: game.timer
      })
    } catch(e) {
      console.error(e)
      throw new ApolloError('Error resetting timer')
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
