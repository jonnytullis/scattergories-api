/*
This export allows you to import files from this directory using this syntax:
    const { GameDAO } = require(./dao)
 */

const SessionDAO = require('./SessionDAO')
const GameDAO = require('./GameDAO')

module.exports = {
  SessionDAO,
  GameDAO
}
