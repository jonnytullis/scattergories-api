
module.exports.games = (_, __, { GameDAO }) => GameDAO.getAll() // FIXME delete this

module.exports.user = (_, __, { auth }) => {
  const { user } = auth.authorizeUser()
  return user
}
