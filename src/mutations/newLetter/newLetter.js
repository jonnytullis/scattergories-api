const { ApolloError } = require('apollo-server')

const gql = require('../../../gql')

function getRandomLetter() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}

const mutation = gql`
    newLetter: NewLetterPayload!
`

const typeDefs = gql`
    type NewLetterPayload {
        letter: String!
    }
`

const resolver = {
  async newLetter (_, __, { auth, GameDAO }) {
    const { game } = auth.authorizeHost()

    let newLetter
    try {
      newLetter = await GameDAO.updateLetter(game.id, getRandomLetter())
    } catch(e) {
      throw new ApolloError('Error updating letter')
    }

    return {
      letter: newLetter
    }
  }
}

module.exports = {
  mutation,
  typeDefs,
  resolver
}
