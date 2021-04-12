const gameUpdated = require('./gameUpdated/gameUpdated')

module.exports = {
  resolvers: {
    ...gameUpdated.resolver,
  },
  typeDefs: `
    ${gameUpdated.typeDefs}
  `,
  subscriptions: `
    type Subscription {
      ${gameUpdated.subscription}
    }
  `
}
