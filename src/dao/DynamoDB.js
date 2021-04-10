const AWS = require('aws-sdk')

const options = new AWS.Config({ region: 'us-west-2' }) // Credentials come from local AWS CLI configuration

module.exports.DynamoDB = new AWS.DynamoDB.DocumentClient(options)
