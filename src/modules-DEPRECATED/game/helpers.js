
module.exports.generateGameId = function () {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

module.exports.getRandomLetter = function () {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return alphabet[Math.floor(Math.random() * alphabet.length)]
}

module.exports.getDefaultSettings = () => ({
  timerSeconds: 180,
  numPrompts: 12
})

function generateUserId () {
  return Math.random().toString(36).slice(2)
}

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
    id: generateUserId(),
    name: name,
    color: colors[numPlayers % colors.length] // Cycle through avatar colors
  }
}
