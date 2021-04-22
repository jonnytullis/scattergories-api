const AWS = require('aws-sdk')

// Global AWS configuration
AWS.config.update({
  region: 'us-west-2',
  retryDelayOptions: { base: 300 }
})

const { gql } = require('apollo-server')
const { GooglePubSub } = require('@axelspringer/graphql-google-pubsub')

const queries = require('./queries')
const mutations = require('./mutations')
const subscriptions = require('./subscriptions')
const types = require('./types')
const { GameDAO, SessionDAO } = require('./dao')
const { getAuthContext } = require('./authorization')

// These are placeholders that get extended in each module typedef
const typeDefsString = `
  ${types}
  ${mutations.typeDefs}
  ${mutations.mutations}
  ${queries.typeDefs}
  ${queries.queries}
  ${subscriptions.typeDefs}
  ${subscriptions.subscriptions}
`

const typeDefs = gql(typeDefsString)

const resolvers = {
  Query: { ...queries.resolvers },
  Mutation: { ...mutations.resolvers },
  Subscription: { ...subscriptions.resolvers }
}

function getGoogleCredentials() {
  const ssm = new AWS.SSM()
  return new Promise((resolve, reject) => (
    ssm.getParameter({
      Name: 'scattergories-api-credentials-google',
      WithDecryption: true
    }, (err, data) => {
      if (err) {
        reject('Unable to retrieve Google credentials from SSM. ' + err.message)
      }
      const credentials = JSON.parse(data.Parameter.Value)
      resolve(credentials)
    })
  ))
}

async function getPubSubOptions() {
  const credentials = await getGoogleCredentials()
  const options = {
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key
    }
  }
  const topic2SubName = topicName => `${topicName}-scattergories-api-${process.env.NODE_ENV === 'development' ? 'dev' : 'prd'}`
  const commonMessageHandler = ({ data }) => {
    return JSON.parse(data.toString())
  }
  return { options, topic2SubName, commonMessageHandler }
}

let pubsub
getPubSubOptions().then(result => {
  const { options, topic2SubName, commonMessageHandler } = result
  pubsub = new GooglePubSub(options, topic2SubName, commonMessageHandler)
})

module.exports = {
  context: async ({ req, connection, payload }) => {
    // req is sent with queries and mutations, payload is sent with websocket subscriptions.
    //    Either way, we need to get the current session ID
    let sessionId
    if (req) {
      sessionId = req.headers.authorization?.split(' ')?.[1]
    } else if (connection) {
      // connection context for graphql playground, payload for react app
      const authString = connection.context?.authorization || payload?.authorization
      sessionId = authString?.split(' ')?.[1]
    }

    // Get the auth context resources
    const auth = await getAuthContext(sessionId)

    const dataSources = {
      SessionDAO,
      GameDAO
    }

    return {
      auth,
      dataSources,
      pubsub
    }
  },
  typeDefs,
  resolvers,
}
