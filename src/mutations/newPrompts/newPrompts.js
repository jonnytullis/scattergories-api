const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')

const mutation = gql`
    newPrompts: NewPromptsPayload!
`

const typeDefs = gql`
    type NewPromptsPayload {
        prompts: [String!]!
    }
`

const resolver = {
  async newPrompts (_, __, { auth, pubsub, dataSources }) {
    let { game } = auth.authorizeHost()
    const prompts = dataSources.PromptsDAO.getRandomPrompts(game.settings?.numPrompts)

    try {
      game.prompts = await dataSources.GameDAO.updateGameProp(game.id, 'prompts', prompts)
    } catch(e) {
      throw new ApolloError('Error updating game prompts')
    }

    await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

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
