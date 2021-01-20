// This is here for the sole purpose of types Query, Mutation, and Subscriptions to be extended in other files
// It's necessary to define these here because GraphQL will throw an error if these types are empty.

const { gql } = require('apollo-server')

const root = gql`
    type Query {
        root: String
    }
    type Mutation {
        root: String
    }
    type Subscription {
        root: String
    }
`
module.exports = root