const { gql } = require('apollo-server')
const { GameDAO, UserDAO } = require('../../dao')

const typeDefs = gql`
    type User {
        id: ID! # TODO Add authorization so users can only see their own user ID
        name: String! # This is their display name
    }

    extend type Query {
        users: [User!]!
    }

    extend type Mutation {
        createUser(name: String): User!, # createUser needs to be done before anything else
        updateUser(userId: ID!, name: String!): User!
    }
`

function generateUserId() {
    return Math.random().toString(36).slice(2, 30)
}

function defaultUserName() {
    return 'Mysterious Giraffe'
}

const resolvers = {
    Query: {
        users: () => UserDAO.getAll()
    },
    Mutation: {
        createUser: (_, { name = '' }) => {
            const user = {
                id: generateUserId(),
                name: name.trim() || defaultUserName()
            }

            UserDAO.add(user)

            return user
        }
    }
}

module.exports = {
    typeDefs,
    resolvers
}