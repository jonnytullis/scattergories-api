/*
 * Returns a timer subscription channel key given a gameId
 *    Use this instead of the gameId in case there is ever
 *    a different subscription type using the gameId as the
 *    channel.
 */
module.exports.getChannel = (gameId) => `${gameId}_TIMER_CHANNEL`
