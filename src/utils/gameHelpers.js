const colors = [
  '#c70039',
  '#11698e',
  '#fdb827',
  '#00af91',
  '#eb5e0b',
  '#91684a',
  '#007944',
  '#6155a6',
  '#790c5a',
  '#7e7474'
]

module.exports.createUser = function (name, numPlayers = 0) {
  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    name: name,
    color: colors[numPlayers % colors.length] // Cycle through avatar colors
  }
}

module.exports.createTimer = function (seconds = module.exports.getDefaultSettings().timerSeconds) {
  return {
    seconds,
    isRunning: false
  }
}

module.exports.generateGameId = () => {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

module.exports.getDefaultSettings = () => ({
  timerSeconds: 180,
  numPrompts: 12
})

module.exports.getDynamoTTL = () => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1) // Data will live for one day in DynamoDB
  return Math.round(tomorrow.getTime() / 1000) // Unix timestamp
}

module.exports.getRandomLetter = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}
