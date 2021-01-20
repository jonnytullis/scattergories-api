const { ApolloError } = require('apollo-server')
const { GameDAO, UserDAO } = require('../../../dao')
const { gamesSubscribers } = require('./subscription')

module.exports.createGame = (_, { userId, gameName = '' }) => {
    const host = UserDAO.get(userId)
    if (!host) {
        throw new ApolloError('User ID not found', '404')
    }
    const game = {
        id: generateGameId(),
        name: gameName.trim() || `${host.name}'s Game`,
        host,
        players: []
    }

    GameDAO.add(game)

    gamesSubscribers.forEach(fn => fn())

    return game
}

module.exports.leaveGame = (gameId, userId) => {
    // Find the game
    const game = GameDAO.get(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }

    const playerIndex = game.players.findIndex(user => user.id === userId)

    if (playerIndex < 0) {
        throw new ApolloError(`Player not found in Game with ID ${gameId}`, '404')
    }

    game.players.splice(playerIndex, 1)

    return game
}

module.exports.joinGame = (_, { gameId, userId }) => {
    // Find the game
    const game = GameDAO.get(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    // Find the user
    const user = UserDAO.get(userId)
    if (!user) {
        throw new ApolloError(`User ID ${userId} not found`, '404')
    }

    game.players.push(user)

    return game
}

function generateGameId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase()
}