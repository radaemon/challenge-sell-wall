const express = require('express')
const bodyParser = require('body-parser')
const createListings = require('./listings/createListings')
const getListings = require('./listings/getListings')

require('dotenv').config()

const app = express()

app.use(bodyParser.json())

app.get(`/`, (req, res) => {
  res.send('hello world!')
})

app.get(`/scrapeListings/:slug`, async (req, res) => {
  const slug = req.params.slug
  const listings = await getListings(slug)
  if (listings?.listings.length > 0) res.send(listings)
  if (!listings)
    res.send(`Updating the listing: ${slug}. Please come back in five minutes.`)
  const result = await createListings(slug).catch((err) => console.log(err))
  console.log(result)
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`server running...`)
})
