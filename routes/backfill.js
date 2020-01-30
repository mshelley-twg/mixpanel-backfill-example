const express = require('express')
const axios = require('axios')
const base64 = require('base-64')

const router = express.Router()

/**
 * @param {(number|string)} userId
 * @param {object} userProperties
 */
const createUserChangeRequest = (userId, userProperties) => {
  return {
    $token: process.env.MIXPANEL_TOKEN,
    $distinct_id: userId,
    // Do not update "Last Seen" time for user
    $ignore_time: true,
    $set: userProperties
  }
}

/**
 * @param {(object|object[])} changeRequests
 * @return {string}
 */
const getChangeRequestUrl = changeRequests => {
  // Encode requests to pass to Mixpanel
  const encodedChangeRequests = base64.encode(JSON.stringify(changeRequests))
  return `https://api.mixpanel.com/engage?data=${encodedChangeRequests}`
}

// Backfill all users
router.post('/', async (_, res, next) => {
  // TODO: Fetch real changes for all users
  const changesByUserId = {
    1: {
      total_conversations: 42
    },
    2: {
      total_conversations: 42
    }
  }

  // Create change requests for all users
  const changeRequests = Object.entries(changesByUserId)
    .map(([userId, changes]) => createUserChangeRequest(userId, changes))

  // TODO: Batch requests to a max of 50

  try {
    // For multiple users, we must use application/x-www-form-urlencoded
    // https://developer.mixpanel.com/docs/http#section-batch-requests
    const { data } = await axios({
      url: getChangeRequestUrl(changeRequests),
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })

    // Mixpanel returns 1 for success, and 0 for failure
    if (data === 1) {
      res.status(201).send('Successfully updated Mixpanel user profiles')
    } else {
      throw new Error('Unable to update Mixpanel user profiles')
    }
  } catch (error) {
    next(error)
  }
})

// Backfill a single user
router.post('/:userId', async (req, res, next) => {
  const { userId } = req.params

  // TODO: Fetch real changes
  const changes = {
    total_conversations: 42
  }

  // Create the change request
  const changeRequest = createUserChangeRequest(userId, changes)

  try {
    const { data } = await axios.post(
      getChangeRequestUrl(changeRequest)
    )

    // Mixpanel returns 1 for success, and 0 for failure
    if (data === 1) {
      res.status(201).send('Successfully updated a Mixpanel user profile')
    } else {
      throw new Error('Unable to update a Mixpanel user profile')
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
