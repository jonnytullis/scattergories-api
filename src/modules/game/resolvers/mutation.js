const { ApolloError } = require('apollo-server')
const { GameDAO, UserDAO } = require('../../../dao')
const subscriptions = require('./subscription')

module.exports.createGame = (_, { userId }) => {
    const host = UserDAO.get(userId)
    if (!host) {
        throw new ApolloError('User ID not found', '404')
    }
    const game = {
        id: generateGameId(),
        name: `${host.name}'s Game`,
        host,
        players: [],
        settings: generateDefaultSettings()
    }

    GameDAO.add(game)
    subscriptions.games.getSubscribers().forEach(fn => fn()) // Publish the list of games to EVERY client in subscribers

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

module.exports.rollDice = (_, { gameId }) => {
    let game = GameDAO.setDiceValue(gameId, getRandomDiceValue())
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    return game
}

function generateGameId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function getRandomDiceValue() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return alphabet[Math.floor(Math.random() * alphabet.length)]
}

function generateDefaultSettings() {
    return {
        timerSeconds: 180
    }
}