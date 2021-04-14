const allPrompts = require('./prompts.json')

/** Returns a number of random prompts **/
module.exports.getRandomPrompts = (num) => {
  if (num < allPrompts.length) {
    const result = []
    const usedIndexes = [] // To ensure there are not duplicates
    for (let i = 0; i < num; i++) {
      const randomIndex = Math.floor(Math.random() * allPrompts.length)
      if (!usedIndexes.includes(randomIndex)) {
        result.push(allPrompts[randomIndex])
        usedIndexes.push(randomIndex)
      } else {
        i--
      }
    }
    return result
  }
  return allPrompts
}
