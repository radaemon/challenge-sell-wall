const express = require('express')
const bodyParser = require('body-parser')
// const { PrismaClient } = require('@prisma/client')
const scrapeListings = require('./scrape-listings/scrapeListings')

const app = express()
// const prisma = new PrismaClient()

app.use(bodyParser.json())

app.get(`/`, (req, res) => {
  res.send('hello world!')
})

app.get(`/scrapeListings/:slug`, (req, res) => {
  scrapeListings(req.params.slug)
    .then((r) => {
      console.log(r)
    })
    .catch((err) => {
      console.log(err)
    })
  res.send(`Updating the db with the collection: ${req.params.slug}`)
})

app.listen(3000, () => {
  console.log(`server running at port: 3000`)
})
