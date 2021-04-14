const createGame = require('./createGame/createGame')
const joinGame = require('./joinGame/joinGame')
const leaveGame = require('./leaveGame/leaveGame')
const newLetter = require('./newLetter/newLetter')
const newPrompts = require('./newPrompts/newPrompts')
const startTimer = require('./startTimer/startTimer')
const updateSettings = require('./updateSettings/updateSettings')

module.exports = {
  resolvers: {
    ...createGame.resolver,
    ...joinGame.resolver,
    ...leaveGame.resolver,
    ...newLetter.resolver,
    ...newPrompts.resolver,
    ...startTimer.resolver,
    ...updateSettings.resolver
  },
  typeDefs: `
    ${createGame.typeDefs}
    ${joinGame.typeDefs}
    ${leaveGame.typeDefs}
    ${newLetter.typeDefs}
    ${newPrompts.typeDefs}
    ${startTimer.typeDefs}
    ${updateSettings.typeDefs}
  `,
  mutations: `
    type Mutation {
      ${createGame.mutation}
      ${joinGame.mutation}
      ${leaveGame.mutation}
      ${newLetter.mutation}
      ${newPrompts.mutation}
      ${startTimer.mutation}
      ${updateSettings.mutation}
    }
  `
}
