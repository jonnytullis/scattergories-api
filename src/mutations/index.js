const createGame = require('./createGame/createGame')

module.exports = {
  resolvers: {
    ...createGame.resolver
  },
  typeDefs: `
    ${createGame.typeDefs}
  `,
  mutations: `
    type Mutation {
      ${createGame.mutation}
    }
  `
}
