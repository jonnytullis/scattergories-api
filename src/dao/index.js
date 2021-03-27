/*
This export allows you to import files from this directory using this syntax:
    const { GameDAO } = require(./dao)
 */

const AuthTokenDAO = require('./AuthTokenDAO')
const GameDAO = require('./GameDAO')
const PromptsDAO = require('./PromptsDAO')
const TimerDAO = require('./TimerDAO')

module.exports = {
  AuthTokenDAO,
  GameDAO,
  PromptsDAO,
  TimerDAO
}
