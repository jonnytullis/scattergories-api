const { gql } = require('apollo-server')

module.exports = gql`
    type User {
        id: ID! # TODO Add authorization so users can only see their own user ID
        name: String! # display name
    }

    extend type Query {
        users: [User!]!
    }

    extend type Mutation {
        createUser(name: String): CreateUserPayload!
        updateUser(userId: ID!, name: String!): User!
    }
    
    type CreateUserPayload {
        id: ID!
        name: String!
    }
`