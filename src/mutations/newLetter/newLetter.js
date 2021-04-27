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
    const { game } = auth.authorizeHost()

    let letter = getRandomLetter()
    while (letter === game.letter) {
      letter = getRandomLetter()
    }

    let updates
    try {
      updates = await dataSources.GameDAO.updateGame(game.id, { letter })
    } catch(e) {
      console.error(e)
      throw new ApolloError('Error updating letter')
    }

    pubsub.publish('GAME_UPDATED', { gameUpdated: { updates, gameId: game.id } })

    return {
      letter: updates.letter
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
