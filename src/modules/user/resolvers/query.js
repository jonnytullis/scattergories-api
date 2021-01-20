const { UserDAO } = require('../../../dao')

module.exports.users = () => UserDAO.getAll()