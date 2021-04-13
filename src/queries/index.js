const user = require('./user/user')

module.exports = {
  resolvers: {
    ...user.resolver
  },
  typeDefs: `
    ${user.typeDefs}
  `,
  queries: `
    type Query {
      ${user.query}
    }
  `
}
