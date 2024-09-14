const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const apicache = require('apicache')
require('dotenv').config()
const errorHandler = require('./middleware/error')

const PORT = process.env.PORT || 3000

const app = express()

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1 * 60 * 1000, // Default: 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 5, // Default: 5 requests per window
  message: 'Too many requests from this IP, please try again later.',
})
app.use(limiter)
app.set('trust proxy', 1)

// Enable cors
app.use(cors())

// Set static folder
app.use(express.static('public'))

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']
  if (token === process.env.AUTH_TOKEN) {
    next()
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

// Routes
app.use('/api', authenticate, require('./routes'))

// Error handler middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
