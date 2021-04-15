const createGame = require('./createGame/createGame')
const joinGame = require('./joinGame/joinGame')
const leaveGame = require('./leaveGame/leaveGame')
const newLetter = require('./newLetter/newLetter')
const updatePrompts = require('./updatePrompts/updatePrompts')
const pauseTimer = require('./pauseTimer/pauseTimer')
const resetTimer = require('./resetTimer/resetTimer')
const startTimer = require('./startTimer/startTimer')
const updateSettings = require('./updateSettings/updateSettings')

module.exports = {
  resolvers: {
    ...createGame.resolver,
    ...joinGame.resolver,
    ...leaveGame.resolver,
    ...newLetter.resolver,
    ...updatePrompts.resolver,
    ...pauseTimer.resolver,
    ...resetTimer.resolver,
    ...startTimer.resolver,
    ...updateSettings.resolver
  },
  typeDefs: `
    ${createGame.typeDefs}
    ${joinGame.typeDefs}
    ${leaveGame.typeDefs}
    ${newLetter.typeDefs}
    ${updatePrompts.typeDefs}
    ${pauseTimer.typeDefs}
    ${resetTimer.typeDefs}
    ${startTimer.typeDefs}
    ${updateSettings.typeDefs}
  `,
  mutations: `
    type Mutation {
      ${createGame.mutation}
      ${joinGame.mutation}
      ${leaveGame.mutation}
      ${newLetter.mutation}
      ${updatePrompts.mutation}
      ${pauseTimer.mutation}
      ${resetTimer.mutation}
      ${startTimer.mutation}
      ${updateSettings.mutation}
    }
  `
}
