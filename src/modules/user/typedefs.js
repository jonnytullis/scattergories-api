const { gql } = require('apollo-server')

module.exports = gql`
    type User {
        id: ID! # TODO Add authorization so users can only see their own user ID
        name: String! # display name
    }
    
    extend type Game {
        host: User!
        players: [User!]!
    }

    extend type Query {
        users: [User!]!
    }

    extend type Mutation {
        createUser(name: String): User! # createUser needs to be done before anything else
        updateUser(userId: ID!, name: String!): User!
    }
`