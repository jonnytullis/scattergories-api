const { ApolloError } = require('apollo-server')
const { GameDAO, UserDAO } = require('../../../dao')
const subscriptions = require('./subscription')

module.exports.createGame = (_, { userId, gameName }) => {
    const host = UserDAO.get(userId)
    if (!host) {
        throw new ApolloError('User ID not found', '404')
    }
    const game = {
        id: generateGameId(),
        name: gameName || `${host.name}'s Game`,
        host,
        players: [],
        settings: generateDefaultSettings()
    }

    GameDAO.add(game)
    subscriptions.games.publishGames()

    return {
        success: true,
        gameId: game.id
    }
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

    return {
        success: true
    }
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
    subscriptions.players.publishParticipants(gameId)

    return {
        success: true,
        gameId: game.gameId
}
}

module.exports.newLetter = (_, { gameId }) => {
    let game = GameDAO.setLetter(gameId, getRandomLetter())
    subscriptions.games.publishGames(gameId)
    if (!game) {
        throw new ApolloError(`Game ID ${gameId} not found`, '404')
    }
    return {
        success: true,
        letter: game.letter
    }
}

function generateGameId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function getRandomLetter() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return alphabet[Math.floor(Math.random() * alphabet.length)]
}

function generateDefaultSettings() {
    return {
        timerSeconds: 180,
        numRounds: 3,
        promptsPerRound: 12
    }
}