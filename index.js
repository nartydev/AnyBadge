const express = require('express')
const app = express()

const port = process.env.PORT || 2137

const { validate, ValidationError: RequestValidationError, Joi } = require('express-validation')
const { makeBadge } = require('badge-maker')

const stripProperties = (original, allowedProperties) =>
  Object.entries(original).reduce((obj, [property, value]) => {
    if (allowedProperties.includes(property)) {
      obj[property] = value
    }
    return obj
  }, {})

// this regex is not perfect but probably enough
const colorRegex = /((?:[0-9a-f]{2}){2,4}$|([0-9a-f]{3}$)|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\)$|brightgreen$|green$|yellow$|yellowgreen$|orange$|red$|blue$|gr[ae]y$|lightgr[ae]y$|success$|important$|critical$|informational$|innactive$)/i

const querySchema = {
  query: Joi.object({
    label: Joi.string(),
    message: Joi.string().required(),
    labelColor: Joi.string().regex(colorRegex),
    color: Joi.string().regex(colorRegex),
    style: Joi.string().valid('plastic', 'flat', 'flat-square', 'for-the-badge', 'social')
  }).unknown(true)
}

app.get('/', (req, res) => {
  res.redirect('https://github.com/KonradLinkowski/AnyBadge')
})

app.get('/badge', validate(querySchema, {}, {}), (req, res) => {
  const badgeData = stripProperties(req.query, [...querySchema.query._ids._byKey.keys()])
  const svg = makeBadge(badgeData)
  res.setHeader('Content-Type', 'image/svg+xml')
  res.send(svg)
})

app.use(function(err, req, res, next) {
  console.error(err)
  if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).json(err)
  }
 
  return res.status(500).json(err)
})

app.listen(port, () => console.log('App started at port:', port))
