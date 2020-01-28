const express = require('express')
const base64 = require('base-64')

const router = express.Router()

// Backfill all users
router.post('/', (req, res) => {
  res.send('Backfill all users - TODO')
})

// Backfill a single user
router.post('/:userId', (req, res) => {
  console.log(`Backfill user with id: ${req.params.userId}`)

  // Create the change request
  const changeRequest = {
    $token: process.env.TOKEN,
    $distinct_id: '13793',
    // Do not update "Last Seen" time for user
    $ignore_time: true,
    $set: {
      Address: '1313 Mockingbird Lane'
    }
  }

  // Base64-encode the JSON string
  const encodedChangeRequest = base64.encode(JSON.stringify(changeRequest))

  res.send(`https://api.mixpanel.com/engage/?data=${encodedChangeRequest}`)
})

module.exports = router
