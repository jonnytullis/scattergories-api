
const timerIntervals = {}
// module.exports.startTimer = (_, __, { auth, pubsub, TimerDAO }) => {
//   const { game } = auth.authorizeHost()
//   const timer = TimerDAO.get(game.id)
//
//   if (!timer) {
//     throw new ApolloError(`Could not find associated timer for game: ${game.id}`)
//   }
//
//   TimerDAO.update(game.id, { isRunning: true })
//   pubsub.publish('TIMER', { timer })
//
//   timerIntervals[game.id] = setInterval(() => {
//     if (timer.remaining > 0) {
//       timer.remaining--
//     } else {
//       clearInterval(timerIntervals[game.id])
//       timer.isRunning = false
//     }
//
//     TimerDAO.update(game.id, timer)
//     pubsub.publish('TIMER', { timer })
//   }, 1000)
// }

module.exports.pauseTimer = (_, __, { auth, pubsub, TimerDAO }) => {
  const { game } = auth.authorizeHost()
  const timer = TimerDAO.get(game.id)

  clearInterval(timerIntervals[game.id])
  timer.isRunning = false
  TimerDAO.update(game.id, timer)

  pubsub.publish('TIMER', { timer })
}

module.exports.resetTimer = (_, __, { auth, pubsub, TimerDAO }) => {
  const { game } = auth.authorizeHost()
  const timer = TimerDAO.get(game.id)

  clearInterval(timerIntervals[game.id])
  timer.isRunning = false
  timer.remaining = game.settings?.timerSeconds || timer.seconds
  TimerDAO.update(game.id, timer)

  pubsub.publish('TIMER', { timer })
}
