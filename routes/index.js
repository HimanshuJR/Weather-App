const express = require('express')
const router = express.Router()
const needle = require('needle')
const apicache = require('apicache')
const url = require('url')

// Env vars
const API_BASE_URL = process.env.API_BASE_URL
const API_KEY_NAME = process.env.API_KEY_NAME
const API_KEY_VALUE = process.env.API_KEY_VALUE

// Init cache
const cacheDuration = process.env.CACHE_DURATION || '5 minutes'
let cache = apicache.middleware

router.get('/', cache(cacheDuration), async (req, res, next) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...url.parse(req.url, true).query,
    })

    const apiRes = await needle('get', `${API_BASE_URL}?${params}`)
    const data = apiRes.body

    // Log the request to the public API
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] REQUEST: ${API_BASE_URL}?${params} - IP: ${req.ip}`)
    }

    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
})

module.exports = router
