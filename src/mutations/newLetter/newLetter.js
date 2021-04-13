const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { getRandomLetter } = require('../../helpers/gameHelpers')

const mutation = gql`
    newLetter: NewLetterPayload!
`

const typeDefs = gql`
    type NewLetterPayload {
        letter: String!
    }
`

const resolver = {
  async newLetter (_, __, { auth, pubsub, dataSources }) {
    const { game } = auth.authorizeHost()

    try {
      game.letter = await dataSources.GameDAO.updateGame(game.id, 'letter', getRandomLetter())
    } catch(e) {
      throw new ApolloError('Error updating letter')
    }

    await pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })

    return {
      letter: game.letter
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
