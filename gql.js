/**
 * This is a string template that just passes the string through. It's purpose is so that extensions can color code
 * graphQL types and aid in development.
 *
 * Apollo-server also has this functionality, but I chose to defer it's usage until the Apollo-server actually needs it.
 * Leaving our graphQL types in a string has advantages when debugging.
 * @param {string[]} strings List of strings separated by interpolated data
 * @param {string[]} parts   List of interpolated data
 */
module.exports = function(strings, ...parts) {
  return strings.reduce((acc, cur, i) => `${acc}${cur}${parts[i] || ''}`, '')
}
