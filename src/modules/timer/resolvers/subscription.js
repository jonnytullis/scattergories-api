const { ApolloError, withFilter } = require('apollo-server')

module.exports.timer = {
  subscribe: withFilter((_, __, { auth, pubsub, TimerDAO }) => {
    const { game } = auth.authorizeUser()

    const timer = TimerDAO.get(game.id)

    if (!timer) {
      throw new ApolloError('Could not find timer in database.')
    }

    // Send a the timer right away (on next tick)
    setTimeout(() => {
      pubsub.publish('TIMER', { timer })
    }, 0)

    return pubsub.asyncIterator([ 'TIMER' ])
  }, (payload, variables) => {
    return payload.timer.gameId === variables.gameId
  })
}

