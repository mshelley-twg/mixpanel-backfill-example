const express = require('express')
const axios = require('axios')
const base64 = require('base-64')

const router = express.Router()

// Backfill all users
router.post('/', (req, res) => {
  res.send('Backfill all users - TODO')
})

// Backfill a single user
router.post('/:userId', async (req, res, next) => {
  const { userId } = req.params

  // Create the change request
  const changeRequest = {
    $token: process.env.MIXPANEL_TOKEN,
    $distinct_id: userId,
    // Do not update "Last Seen" time for user
    $ignore_time: true,
    $set: {
      'Customer Lifetime Value': 42
    }
  }

  // Encode the string to pass as a query to Mixpanel
  const encodedChangeRequest = base64.encode(JSON.stringify(changeRequest))

  // Create the Mixpanel request URL
  const mixpanelRequestUrl = `https://api.mixpanel.com/engage/?data=${encodedChangeRequest}`

  try {
    const { data } = await axios.post(mixpanelRequestUrl)

    // Mixpanel returns 1 for success, and 0 for failure
    if (data === 1) {
      res.status(201).send('Successfully updated a Mixpanel user profile')
    } else {
      throw new Error('Mixpanel returned failure code')
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
