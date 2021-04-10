const createGame = require('./createGame/createGame')
const joinGame = require('./joinGame/joinGame')

module.exports = {
  resolvers: {
    ...createGame.resolver,
    ...joinGame.resolver
  },
  typeDefs: `
    ${createGame.typeDefs}
    ${joinGame.typeDefs}
  `,
  mutations: `
    type Mutation {
      ${createGame.mutation}
      ${joinGame.mutation}
    }
  `
}
