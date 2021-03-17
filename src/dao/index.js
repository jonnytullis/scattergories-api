/*
This export allows you to import files from this directory using this syntax:
    const { GameDAO } = require(./dao)
 */

const GameDAO = require('./GameDAO')
const PromptsDAO = require('./PromptsDAO')

module.exports = {
  GameDAO,
  PromptsDAO
}
