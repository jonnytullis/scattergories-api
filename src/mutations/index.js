const createGame = require('./createGame/createGame')
const joinGame = require('./joinGame/joinGame')
const leaveGame = require('./leaveGame/leaveGame')
const newLetter = require('./newLetter/newLetter')
const newPrompts = require('./newPrompts/newPrompts')
const updateSettings = require('./updateSettings/updateSettings')

module.exports = {
  resolvers: {
    ...createGame.resolver,
    ...joinGame.resolver,
    ...leaveGame.resolver,
    ...newLetter.resolver,
    ...newPrompts.resolver,
    ...updateSettings.resolver
  },
  typeDefs: `
    ${createGame.typeDefs}
    ${joinGame.typeDefs}
    ${leaveGame.typeDefs}
    ${newLetter.typeDefs}
    ${newPrompts.typeDefs}
    ${updateSettings.typeDefs}
  `,
  mutations: `
    type Mutation {
      ${createGame.mutation}
      ${joinGame.mutation}
      ${leaveGame.mutation}
      ${newLetter.mutation}
      ${newPrompts.mutation}
      ${updateSettings.mutation}
    }
  `
}
