const prisma = require("../utils/prisma");

const getImageUrls = (files) => {
  if (!files || !files.carImages) {
    return [];
  }
  return files.carImages.map((file) => file.path);
};

exports.createCar = async (carData) => {
  const {
    dealerId,
    designerId,
    workshopId,
    imageUrls,
    videoUrls,
    primaryImage,
    ...restOfCarData
  } = carData;

  const dataForDatabase = {
    ...restOfCarData,
    carImages: imageUrls,
    videoUrls: videoUrls,
    thumbnail: primaryImage,
    dealer: {
      connect: { id: dealerId },
    },
  };

  if (designerId) {
    dataForDatabase.designer = { connect: { id: designerId } };
  }
  if (workshopId) {
    dataForDatabase.workshop = { connect: { id: workshopId } };
  }

  const newCar = await prisma.car.create({
    data: dataForDatabase,
  });
  return newCar;
};

exports.fetchLatestAdditions = async () => {
  return prisma.car.findMany({
    where: {
      status: "AVAILABLE",
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      badges: true,
      brand: true,
    },
  });
};

exports.getTotalCars = async () => {
  return prisma.car.count();
};

exports.getCarById = async (id) => {
  return prisma.car.findUnique({
    where: { id: id },
    select: {
      id: true,
      title: true,
      description: true,
      brand: true,
      status: true,
      sellingPrice: true,
      ybtPrice: true,
      thumbnail: true,
      carImages: true,
      videoUrls: true,
      engine: true,
      kmsDriven: true,
      peakPower: true,
      peakTorque: true,
      exteriorColour: true,
      doors: true,
      driveType: true,
      transmission: true,
      seatingCapacity: true,
      fuelType: true,
      mileage: true,
      registrationYear: true,
      registrationNumber: true,
      ownerCount: true,
      insurance: true,
      city: true,
      badges: true,
      specs: true,
      features: true,
      dealer: {
        select: {
          name: true,
        },
      },
    },
  });
};

exports.getCarsByDealer = async (dealerId) => {
  const cars = await prisma.car.findMany({
    where: {
      dealerId: dealerId,
    },
    select: {
      id: true,
      title: true,
      brand: true,
      badges: true,
      ybtPrice: true,
      thumbnail: true,
      createdAt: true,
      dealer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return cars;
};

exports.updateCarById = async (carId, dataToUpdate) => {
  if (dataToUpdate.carImages) {
    const existingCar = await prisma.car.findUnique({
      where: { id: carId },
      select: { carImages: true },
    });

    const existingImages = existingCar?.carImages || [];
    dataToUpdate.carImages = [...existingImages, ...dataToUpdate.carImages];
  }

  return prisma.car.update({
    where: { id: carId },
    data: dataToUpdate,
  });
};

exports.deleteCar = async (id) => {
  return prisma.car.delete({
    where: { id: id },
  });
};

exports.getAllCars = async (options = {}) => {
  const {
    cursor,
    //searchTerm,
    brands,
    sortBy = "newest",
    collectionType,
    designerId,
    limit = 10,
  } = options;

  const where = {};
  if (collectionType)
    where.collectionType = { equals: collectionType.toUpperCase() };
  if (designerId) where.designerId = designerId;
  // if (searchTerm) {
  //   where.OR = [
  //     { title: { contains: searchTerm, mode: "insensitive" } },
  //     { description: { contains: searchTerm, mode: "insensitive" } },
  //   ];
  // }
  if (brands) {
    const brandList = brands
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
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
      badges: true,
      specs: true,
      registrationYear: true,
      ybtPrice: true,
      tuningStage: true,
      thumbnail: true,
      createdAt: true,
    },
  };
  if (cursor) {
    prismaQuery.cursor = { id: cursor }; // Already a number
    prismaQuery.skip = 1;
  }
  const results = await prisma.car.findMany(prismaQuery);
  const hasMore = results.length > limit;
  const cars = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? cars[cars.length - 1].id : null;

  return {
    data: cars,
    pagination: { hasMore, nextCursor },
  };
};

exports.getCarFilters = async () => {
  // 1. Get all unique brands
  const brandsRaw = await prisma.car.findMany({
    where: { status: "AVAILABLE" }, // Only show brands that actually have cars for sale
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  // 2. Get Min/Max Price and Year (for sliders/ranges)
  const stats = await prisma.car.aggregate({
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
