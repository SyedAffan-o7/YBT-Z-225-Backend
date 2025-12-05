const prisma = require("../utils/prisma");

const getImageUrls = (files) => {
  if (!files || !files.bikeImages) {
    return [];
  }
  return files.bikeImages.map((file) => file.path);
};

exports.createBike = async (bikeData) => {
  const { dealerId, imageUrls, videoUrls, primaryImage, ...restOfBikeData } =
    bikeData;

  const dataForDatabase = {
    ...restOfBikeData,
    bikeImages: imageUrls,
    videoUrls: videoUrls,
    thumbnail: primaryImage,
    dealer: {
      connect: { id: dealerId },
    },
  };

  const newBike = await prisma.bike.create({
    data: dataForDatabase,
    include: {
      dealer: true,
    },
  });

  return newBike;
};

exports.searchBikes = async (options = {}) => {
  const { searchTerm, cursor, sortBy = "newest", limit = 10 } = options;
  const where = {
    status: "AVAILABLE",
  };

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { brand: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const orderByMap = {
    name_asc: [{ title: "asc" }, { id: "asc" }],
    name_desc: [{ title: "desc" }, { id: "asc" }],
    price_asc: [{ sellingPrice: "asc" }, { id: "asc" }],
    price_desc: [{ sellingPrice: "desc" }, { id: "asc" }],
    oldest: [{ createdAt: "asc" }, { id: "asc" }],
    newest: [{ createdAt: "desc" }, { id: "desc" }],
  };

  const orderBy = orderByMap[sortBy] || orderByMap.newest;

  const prismaQuery = {
    take: limit + 1,
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      brand: true,
      badges: true,
      specs: true,
      registrationYear: true,
      ybtPrice: true,
      thumbnail: true,
    },
  };

  if (cursor) {
    prismaQuery.cursor = { id: cursor };
    prismaQuery.skip = 1; // Skip the cursor item itself
  }

  const results = await prisma.bike.findMany(prismaQuery);
  const hasMore = results.length > limit;
  const bikes = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? cars[cars.length - 1].id : null;
  return {
    data: bikes,
    pagination: {
      hasMore,
      nextCursor,
      totalFetched: bikes.length,
    },
  };
};

exports.getBikeFilters = async () => {
  // 1. Get all unique brands
  const brandsRaw = await prisma.bike.findMany({
    where: { status: "AVAILABLE" }, // Only show brands that actually have cars for sale
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  // 2. Get Min/Max Price and Year (for sliders/ranges)
  const stats = await prisma.bike.aggregate({
    where: { status: "AVAILABLE" },
    _min: {
      sellingPrice: true,
      registrationYear: true,
    },
    _max: {
      sellingPrice: true,
      registrationYear: true,
    },
  });

  return {
    brands: brandsRaw.map((b) => b.brand).filter(Boolean), // Returns ["Audi", "BMW", ...]
    minPrice: stats._min.sellingPrice || 0,
    maxPrice: stats._max.sellingPrice || 0,
    minYear: stats._min.registrationYear || 2000,
    maxYear: stats._max.registrationYear || new Date().getFullYear(),
  };
};

exports.getAllBikes = async (options = {}) => {
  const {
    cursor,
    //searchTerm,
    brands,
    sortBy = "newest",
    limit = 10,
  } = options;

  const where = {};

  if (brands) {
    const brandList = brands
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b);
    if (brandList.length > 0) where.brand = { in: brandList };
  }

  const orderByMap = {
    name_asc: [{ title: "asc" }, { id: "asc" }],
    name_desc: [{ title: "desc" }, { id: "asc" }],
    oldest: [{ createdAt: "asc" }, { id: "asc" }],
    newest: [{ createdAt: "desc" }, { id: "desc" }],
  };
  const orderBy = orderByMap[sortBy] || orderByMap.newest;

  const prismaQuery = {
    take: limit + 1,
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      brand: true,
      specs: true,
      badges: true,
      registrationYear: true,
      ybtPrice: true,
      thumbnail: true,
      createdAt: true,
    },
  };

  if (cursor) {
    prismaQuery.cursor = { id: parseInt(cursor) };
    prismaQuery.skip = 1;
  }
  const results = await prisma.bike.findMany(prismaQuery);

  const hasMore = results.length > limit;
  const bikes = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? bikes[bikes.length - 1].id : null;

  return {
    data: bikes,
    pagination: { hasMore, nextCursor },
    filters: { brands: brands || null, sortBy },
  };
};

exports.updateBikeById = async (bikeId, dataToUpdate) => {
  return prisma.bike.update({
    where: { id: bikeId },
    data: dataToUpdate,
  });
};

exports.getTotalBikes = async () => {
  return prisma.bike.count();
};

exports.getBikeById = async (id) => {
  const bike = await prisma.bike.findUnique({
    where: { id: parseInt(id) },
    include: {
      dealer: true,
    },
  });
  return bike;
};

exports.deleteBikeById = async (id) => {
  return prisma.bike.delete({
    where: { id: id },
  });
};

// exports.getAllBikes = async (queryParams) => {
//   // 1. Sanitize and prepare inputs
//   const { cursor, searchTerm, brands } = queryParams;
//   const limit = Math.min(parseInt(queryParams.limit) || 10, 100);
//   const allowedSorts = ["newest", "oldest", "name_asc", "name_desc"];
//   const sortBy = allowedSorts.includes(queryParams.sortBy)
//     ? queryParams.sortBy
//     : "newest";

//   // 3. Build dynamic WHERE clause
//   const where = {};
//   if (searchTerm) {
//     where.OR = [
//       { title: { contains: searchTerm, mode: "insensitive" } },
//       { description: { contains: searchTerm, mode: "insensitive" } },
//     ];
//   }
//   if (brands) {
//     const brandList = brands
//       .split(",")
//       .map((b) => b.trim())
//       .filter((b) => b);
//     if (brandList.length > 0) where.brand = { in: brandList };
//   }

//   // 4. Build dynamic ORDER BY clause
//   const orderByMap = {
//     name_asc: { title: "asc" },
//     name_desc: { title: "desc" },
//     oldest: { createdAt: "asc" },
//     newest: { createdAt: "desc" },
//   };
//   const orderBy = orderByMap[sortBy];

//   // 5. Construct and execute the Prisma query
//   const prismaQuery = {
//     take: limit + 1,
//     where,
//     orderBy,
//     select: {
//       id: true,
//       title: true,
//       brand: true,
//       specs: true,
//       badges: true,
//       ybtPrice: true,
//       thumbnail: true,
//       createdAt: true,
//     },
//   };
//   if (cursor) {
//     prismaQuery.cursor = buildPrismaCursor(cursor, sortBy);
//     prismaQuery.skip = 1;
//   }
//   const results = await prisma.bike.findMany(prismaQuery);

//   // 6. Pagination logic
//   const hasMore = results.length > limit;
//   const bikes = hasMore ? results.slice(0, limit) : results;
//   let nextCursor = null;
//   if (hasMore && bikes.length > 0) {
//     nextCursor = JSON.stringify(buildCursor(bikes[bikes.length - 1], sortBy));
//   }

//   // 7. Prepare and cache the final response
//   const responseData = {
//     data: bikes,
//     pagination: { hasMore, nextCursor },
//     filters: { searchTerm: searchTerm || null, brands: brands || null, sortBy },
//   };

//   return responseData;
// };
