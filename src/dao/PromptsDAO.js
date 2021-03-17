const allPrompts = require('./prompts.json') // FIXME this will eventually be a database

const PromptsDAO = {
  /** Returns a number of random prompts **/
  getRandomPrompts: (num) => {
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
}

Object.freeze(PromptsDAO) // Singleton for now to preserve state. This will change when using a database
module.exports = PromptsDAO
