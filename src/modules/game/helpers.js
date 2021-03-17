module.exports.generateGameId = function () {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

module.exports.generateUserId = function () {
  return Math.random().toString(36).slice(2)
}

module.exports.getRandomLetter = function () {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}

module.exports.generateDefaultSettings = function () {
  return {
    timerSeconds: 180,
    numRounds: 3,
    numPrompts: 12
  }
}
