const gql = require('../../../gql')

const query = gql`
    user: User!
`

const resolver = {
  async user (_, __, { auth }) {
    const { user } = auth.authorizeUser()
    return user
  }
}

module.exports = {
  query,
  typeDefs: '',
  resolver
}
