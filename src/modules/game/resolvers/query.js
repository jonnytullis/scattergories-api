const { ApolloError } = require('apollo-server')
const { GameDAO } = require('../../../dao')

module.exports.games = () => GameDAO.getAll()

module.exports.game = (_, { id }) => {
    const game = GameDAO.get(id)
    if (!game) {
        throw new ApolloError('Game not found', '404')
    }
    return game
}

