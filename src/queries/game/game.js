const gql = require('../../../gql')

const query = gql`
    game: Game!
`

const resolver = {
  async game (_, __, { auth }) {
    const { game } = auth.authorizeUser()
    return game
  }
}

module.exports = {
  query,
  typeDefs: '',
  resolver
}
