/*
This export allows you to import files from this directory using this syntax:
    const { GameDAO, UserDAO } = require(./dao)
 */

const GameDAO = require('./GameDAO')
const UserDAO = require('./UserDAO')

module.exports = {
    GameDAO,
    UserDAO
}