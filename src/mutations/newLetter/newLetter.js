const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')
const { getRandomLetter } = require('../../utils/gameHelpers')

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
    let { game } = auth.authorizeHost()

    let letter = getRandomLetter()
    while (letter === game.letter) {
      letter = getRandomLetter()
    }

    try {
      game = await dataSources.GameDAO.updateGame(game.id, { letter })
    } catch(e) {
      console.error(e)
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
