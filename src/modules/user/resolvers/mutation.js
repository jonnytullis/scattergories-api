const { UserDAO } = require('../../../dao')

module.exports.createUser = (_, { name = '' }) => {
    const user = {
        id: generateUserId(),
        name: name.trim() || defaultUserName()
    }

    UserDAO.add(user)
    return user
}

function generateUserId() {
    return Math.random().toString(36).slice(2, 30)
}

function defaultUserName() {
    return 'Mysterious Giraffe'
}