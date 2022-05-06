const express = require('express')
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer-extra')
const { PrismaClient } = require('@prisma/client')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const app = express()
const prisma = new PrismaClient()

puppeteer.use(StealthPlugin())
app.use(bodyParser.json())

// function isPageBottom() {
//   if (
//     window.innerHeight + Math.ceil(window.scrollY) >=
//     document.body.offsetHeight
//   ) {
//     return true
//   }
//   return false
// }

// function sleep(ms) {
//   return new Promise((res) => {
//     setTimeout(res, ms)
//   })
// }

// async function scrollToBottom(page) {
//   await page.evaluate(() => {})
// }

function getParsedListings(gqlRes) {
  const tokenNodes = gqlRes.data.query.search.edges
  const tokensInfo = tokenNodes.map(({ node }) => {
    return {
      tokenId: node.asset.name,
      listPrice:
        Number(
          node.asset.orderData.bestAsk.paymentAssetQuantity.quantityInEth
        ) / 1000000000000000000,
    }
  })
  return tokensInfo
}

async function scrapeListings(collectionSlug) {
  const url = `https://opensea.io/collection/${collectionSlug}`

  const browser = await puppeteer.launch({
    headless: false,
  })

  const page = await browser.newPage()

  await page.goto(url)
  await page.waitForTimeout(100)

  const [buyNowBtn] = await page.$x("//button[contains(text(), 'Buy Now')]")
  await buyNowBtn.click()

  await page.waitForTimeout(500)

  // response listener
  page.on('response', async (response) => {
    const request = response.request()
    if (request.url().includes('graphql')) {
      const tokens = getParsedListings(await response.json())
      // if (tokens.length) bucket.push(...tokens)
      console.log(tokens)
    }
  })

  // await page.evaluate(async () => {
  //   let scrollPosition = 0
  //   let documentHeight = document.body.scrollHeight

  //   while (documentHeight > scrollPosition) {
  //     window.scrollBy(0, documentHeight)
  //     scrollPosition = documentHeight
  //     documentHeight = document.body.scrollHeight
  //   }
  // })
  await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight))

  await browser.close()
}

app.get(`/`, async (req, res) => {
  res.json({ up: true })
})

app.get(`/scrapeAzuki`, async (req, res) => {
  res.send('hello world!')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  scrapeListings('azuki')
  console.log(`server running at port: ${PORT}`)
})

// WAIT FOR A CERTAIN RESPONSE
// await page.waitForResponse((response) =>
//   response.url().includes('graphql')
// )
// WAIT FOR TIMEOUT
// await page.waitForTimeout(200)
//DATABASE_URL="postgres://postgres:1234@localhost:5432"
