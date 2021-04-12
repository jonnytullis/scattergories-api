const createGame = require('./createGame/createGame')
const joinGame = require('./joinGame/joinGame')
const leaveGame = require('./leaveGame/leaveGame')

module.exports = {
  resolvers: {
    ...createGame.resolver,
    ...joinGame.resolver,
    ...leaveGame.resolver
  },
  typeDefs: `
    ${createGame.typeDefs}
    ${joinGame.typeDefs}
    ${leaveGame.typeDefs}
  `,
  mutations: `
    type Mutation {
      ${createGame.mutation}
      ${joinGame.mutation}
      ${leaveGame.mutation}
    }
  `
}
