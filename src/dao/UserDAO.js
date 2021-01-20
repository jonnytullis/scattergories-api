const users = [] // FIXME this will eventually be a database

const UserDAO = {
    add: item => users.push(item),
    get: id => users.find(user => user.id === id),
    getAll: () => JSON.parse(JSON.stringify(users))
}

Object.freeze(UserDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = UserDAO
