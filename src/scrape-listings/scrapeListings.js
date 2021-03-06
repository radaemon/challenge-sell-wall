const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

function getParsedListings(gqlRes) {
  const tokenNodes = gqlRes.data.query.search.edges
  const tokensInfo = tokenNodes.map(({ node }) => {
    return {
      tokenId: node.asset.name,
      listPrice:
        Number(node?.asset.orderData.bestAsk?.paymentAssetQuantity.quantityInEth) /
          1000000000000000000 || null,
    }
  })
  return tokensInfo
}

async function scrollIndefinitely(page) {
  let lastTop = 0
  while (true) {
    // scroll down page with evaluate
    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight))
    // wait some extra time
    await page.waitForTimeout(10000)
    const currTop = await page.$$eval('div[role=gridcell]', (cells) => {
      return cells.reduce((acc, curr) => {
        const currPosition = Number(curr.style.top.slice(0, -2))
        if (currPosition >= acc) return currPosition
        return acc
      }, 0)
    })
    if (lastTop >= currTop) break
    lastTop = currTop
  }
}

async function scrapeCollection(collectionSlug) {
  const url = `https://opensea.io/collection/${collectionSlug}`
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] })
  const bucket = []

  const page = (await browser.pages())[0]
  await page.goto(url, { waitUntil: `networkidle2` })

  // debugging purposes in production
  // await page.screenshot({
  //   path: 'tutorialspoint.png',
  // })

  const [buyNowBtn] = await page.$x("//button[contains(text(), 'Buy Now')]")
  if (!buyNowBtn) throw new Error('Could not find button.')
  await buyNowBtn.click()

  await page.waitForTimeout(500)

  page.on('response', async (response) => {
    const request = response.request()
    if (request.url().includes('graphql')) {
      const tokens = getParsedListings(await response.json())
      console.log('scrolling...')
      if (tokens.length) bucket.push(...tokens)
    }
  })

  await scrollIndefinitely(page)

  await browser.close()

  console.log(bucket)
  return bucket
}

module.exports = scrapeCollection
