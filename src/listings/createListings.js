const { PrismaClient } = require('@prisma/client')
const scrapeListings = require('../scrape-listings/scrapeListings')
const prisma = new PrismaClient()

async function createListings(slug) {
  const listings = await scrapeListings(slug)
  const collectionRecord = await prisma.collection.findUnique({ where: { slug } })
  // if the slug exists delete all listings and create new ones
  if (collectionRecord) {
    await prisma.collection.update({
      where: { slug },
      data: { listings: { deleteMany: {} } },
    })
    return await prisma.collection.update({
      where: { slug },
      data: { listings: { createMany: { data: listings, skipDuplicates: true } } },
    })
  }
  // if not, create the slug and the listings
  return await prisma.collection.create({
    data: { slug, listings: { createMany: { data: listings, skipDuplicates: true } } },
  })
}

module.exports = createListings
