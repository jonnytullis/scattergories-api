const game = require('./game/game')
const user = require('./user/user')

module.exports = {
  resolvers: {
    ...game.resolver,
    ...user.resolver
  },
  typeDefs: `
    ${game.typeDefs}
    ${user.typeDefs}
  `,
  queries: `
    type Query {
      ${game.query}
      ${user.query}
    }
  `
}
