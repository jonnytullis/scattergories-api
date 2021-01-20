const { gql } = require('apollo-server')

const User = gql`
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
module.exports = User