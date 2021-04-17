const { withFilter } = require('apollo-server')

const gql = require('../../../gql')
const leaveGame = require('../../mutations/leaveGame/leaveGame')

const subscription = gql`
    gameUpdated(gameId: ID!): GameUpdatedResponse!
`

const typeDefs = gql`
    type GameUpdatedResponse {
        game: Game
        status: Status
    }
    type Status {
        gameId: ID!
        ended: Boolean
        message: String
    }
`

/** Adds ability to specify what the subscription does when it is canceled by the client **/
function asyncIteratorWithCancel(asyncIterator, onCancel) {
  const asyncReturn = asyncIterator.return

  asyncIterator.return = () => {
    onCancel()
    return asyncReturn ? asyncReturn.call(asyncIterator) : Promise.resolve({ value: undefined, done: true })
  }

  return asyncIterator
}

async function isPlayerActive({ gameId, userId, GameDAO }) {
  const game = await GameDAO.getGame(gameId)
  const user = game?.players?.find(player => player.id === userId)
  return user?.isActive
}

async function setPlayerActive(isActive, { gameId, userId, GameDAO }) {
  const game = await GameDAO.getGame(gameId)
  const index = game?.players?.findIndex(player => player.id === userId)
  if (index >= 0) {
    game.players[index].isActive = isActive
    await GameDAO.updateGame(game.id, { players: game.players })
  }
}

const resolver = {
  gameUpdated: {
    subscribe: withFilter((_, __, { auth, pubsub, dataSources }) => {
      const { game, user } = auth.authorizeUser()

      const context = {
        gameId: game.id,
        userId: user.id,
        GameDAO: dataSources.GameDAO
      }

      const removePlayerIfRemainsInactive = async (milliseconds) => {
        setTimeout(async () => {
          const isActive = await isPlayerActive(context)
          if (isActive === false) { // If undefined, the game doesn't exist anymore
            try {
              await leaveGame.resolver.leaveGame(null, null, { auth, pubsub, dataSources })
            } catch(e) {
              console.error('Error removing inactive player from game.', e)
            }
          }
        }, milliseconds)
      }

      /** Subscription Logic **/
      setPlayerActive(true, context).catch(e => {
        console.error('Error setting player as active in subscription', e)
      })

      // Publish the game right away (setTimeout for nextTick)
      setTimeout(() => {
        pubsub.publish('GAME_UPDATED', { gameUpdated: { game } })
      }, 0)

      return asyncIteratorWithCancel(pubsub.asyncIterator([ 'GAME_UPDATED' ]), () => {
        // This is to ensure that if a player refreshes their page, they'll be re-admitted to the game, but if they
        //      close their browser or navigate away, they'll be removed from the game automatically.
        setPlayerActive(false, context).then(async () => {
          await removePlayerIfRemainsInactive(5000)
        }).catch(e => {
          console.error('Error performing pending player removal.', e)
        })
      })
    },
    (payload, variables) => {
      return payload?.gameUpdated?.game?.id === variables?.gameId ||
        payload?.gameUpdated?.status?.gameId === variables?.gameId
    })
  }
}

module.exports = {
  subscription,
  typeDefs,
  resolver
}
