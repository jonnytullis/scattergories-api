const { ApolloError, ValidationError } = require('apollo-server')

const gql = require('../../../gql')
const { getRandomPrompts } = require('../../utils/prompts/prompts')

const mutation = gql`
    updateSettings(settings: SettingsInput!): UpdateSettingsPayload!
`

const typeDefs = gql`
    type UpdateSettingsPayload {
        settings: Settings
    }

    input SettingsInput {
        timerSeconds: Int
        numPrompts: Int
    }
`

const resolver = {
  async updateSettings (_, { settings }, { auth, pubsub, dataSources }) {
    let { game } = auth.authorizeHost()

    if (settings) {
      const { timerSeconds, numPrompts } = { ...settings }
      if (Number(timerSeconds) < 30) {
        throw new ValidationError('Timer length must be 30 seconds or more')
      }
      if (Number(numPrompts) < 1) {
        throw new ValidationError('Number of prompts must be greater than 1')
      }

      game.settings = {
        timerSeconds: timerSeconds || game.settings.timerSeconds,
        numPrompts: numPrompts || game.settings.numPrompts,
      }
      game.prompts.list = [
        ...game.prompts.list,
        ...getRandomPrompts(game.settings.numPrompts)
      ].slice(0, game.settings.numPrompts)
      game.timer.seconds = game.settings.timerSeconds

      try {
        game = await dataSources.GameDAO.updateGame(game.id, {
          settings: game.settings,
          timer: game.timer,
          prompts: game.prompts
        })
      } catch(e) {
        throw new ApolloError('Error updating settings')
      }
    }

    await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

    return {
      settings: game.settings
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
