const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { getRandomPrompts } = require('../../utils/prompts/prompts')

const mutation = gql`
    updatePrompts(newPrompts: Boolean!, hidden: Boolean): UpdatePromptsPayload!
`

const typeDefs = gql`
    type UpdatePromptsPayload {
        prompts: Prompts
    }
`

const resolver = {
  async updatePrompts (_, { newPrompts, hidden }, { auth, pubsub, dataSources }) {
    const { game } = auth.authorizeHost()
    const prompts = {
      hidden: hidden === undefined ? game.prompts.hidden : hidden,
      list: newPrompts ? getRandomPrompts(game.settings?.numPrompts) : game.prompts.list
    }

    let updates
    try {
      updates = await dataSources.GameDAO.updateGame(game.id, { prompts })
    } catch(e) {
      console.error(e)
      throw new ApolloError('Error updating game prompts')
    }

    await pubsub.publish('GAME_UPDATED', { gameUpdated: { updates, gameId: game.id } })

    return {
      prompts
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
