const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getListings(slug) {
  return await prisma.collection.findUnique({
    where: {
      slug: slug,
    },
    include: {
      listings: {
        select: {
          tokenId: true,
          listPrice: true,
        },
      },
    },
  })
}

module.exports = getListings
