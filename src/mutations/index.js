const createGame = require('./createGame/createGame')
const joinGame = require('./joinGame/joinGame')
const leaveGame = require('./leaveGame/leaveGame')
const newLetter = require('./newLetter/newLetter')
const newPrompts = require('./newPrompts/newPrompts')
const pauseTimer = require('./pauseTimer/pauseTimer')
const startTimer = require('./startTimer/startTimer')
const updateSettings = require('./updateSettings/updateSettings')

module.exports = {
  resolvers: {
    ...createGame.resolver,
    ...joinGame.resolver,
    ...leaveGame.resolver,
    ...newLetter.resolver,
    ...newPrompts.resolver,
    ...pauseTimer.resolver,
    ...startTimer.resolver,
    ...updateSettings.resolver
  },
  typeDefs: `
    ${createGame.typeDefs}
    ${joinGame.typeDefs}
    ${leaveGame.typeDefs}
    ${newLetter.typeDefs}
    ${newPrompts.typeDefs}
    ${pauseTimer.typeDefs}
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
      ${pauseTimer.mutation}
      ${startTimer.mutation}
      ${updateSettings.mutation}
    }
  `
}
