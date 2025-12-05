const carService = require("../services/carService");
const { processUploadedImages } = require("../utils/fileHelper");

exports.createCar = async (req, res) => {
  try {
    const validatedData = req.body;
    const imageFiles = req.files?.images || [];
    const videoFiles = req.files?.videos || [];
    const mobileImageFiles = req.files?.mobileImages || [];
    const mobileVideoFiles = req.files?.mobileVideos || [];
    const imageUrls = imageFiles.map((file) => file.path);
    const videoUrls = videoFiles.map((file) => file.path);
    const mobileImageUrls = mobileImageFiles.map((file) => file.path);
    const mobileVideoUrls = mobileVideoFiles.map((file) => file.path);

    const carData = {
      ...validatedData,
      // Desktop Assets
      imageUrls: imageUrls,
      mobileImageUrls: mobileImageUrls,
      videoUrls: videoUrls,
      mobileVideoUrls: mobileVideoUrls,
      primaryImage: imageUrls[0] || null,
      primaryImageMobile: mobileImageUrls[0] || null,
    };

    const newCar = await carService.createCar(carData);
    res.status(201).json({ success: true, data: newCar });
  } catch (error) {
    console.error("Error in creating a car:", error);
    if (
      error?.code === "P2002" &&
      error.meta?.target?.includes("registrationNumber")
    ) {
      return res.status(409).json({
        success: false,
        message: "A car with this registration number already exists.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create car.",
    });
  }
};

exports.getLatestAdditions = async (req, res) => {
  try {
    const cars = await carService.fetchLatestAdditions();

    // 2. Send the data
    res.status(200).json({
      success: true,
      message: "Latest additions fetched successfully",
      data: cars,
    });
  } catch (error) {
    console.error("Error in getLatestAdditions controller:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch latest additions." });
  }
};

//Add the zod validation for bike, once prisma schema is fixed, and move validation to middleware
exports.getAllCars = async (req, res) => {
  try {
    const options = { ...req.query };
    if (req.query.limit) {
      options.limit = parseInt(req.query.limit, 10);
    }
    if (req.query.designerId) {
      options.designerId = parseInt(req.query.designerId, 10);
    }
    if (req.query.cursor) {
      options.cursor = parseInt(req.query.cursor, 10);
    }
    const result = await carService.getAllCars(options);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error in getAllCars:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cars." });
  }
};

exports.searchCars = async (req, res) => {
  try {
    const { q, collectionType, cursor, sortBy, limit } = req.query;

    const result = await carService.searchCars({
      searchTerm: q,
      collectionType: collectionType,
      cursor: cursor ? parseInt(cursor) : undefined,
      sortBy,
      limit: limit ? parseInt(limit) : 10,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in searching:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cars." });
  }
};

exports.getTotalCars = async (req, res) => {
  try {
    const total = await carService.getTotalCars();
    res.status(200).json({ success: true, data: { totalCars: total } });
  } catch (error) {
    console.error("Failed to get total cars:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get total number of cars." });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await carService.getCarById(id);
    if (!car) {
      return res
        .status(404)
        .json({ success: false, message: "Car not found." });
    }
    res.set("Cache-Control", "public, max-age=60");
    res.status(200).json({ success: true, data: car });
  } catch (err) {
    console.error(`Failed to get car ${req.params.id}:`, err);
    res.status(500).json({ success: false, message: "Failed to fetch car." });
  }
};

exports.getCarsByDealer = async (req, res) => {
  try {
    const { dealerId } = req.params;
    const cars = await carService.getCarsByDealer(dealerId);
    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    console.error(
      `Failed to fetch cars for dealer ${req.params.dealerId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch cars for the dealer.",
    });
  }
};

exports.updateCar = async (req, res) => {
  try {
    //Add the zod validation for bike, once prisma schema is fixed, and move validation to middleware
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid car ID provided." });
    }
    const dataToUpdate = { ...req.body };
    if (req.files && req.files.carImages) {
      dataToUpdate.carImages = req.files.carImages.map((file) => file.path);
    }
    if (dataToUpdate.dealerId) {
      dataToUpdate.dealerId = parseInt(dataToUpdate.dealerId, 10);
    }
    if (dataToUpdate.kmsDriven) {
      dataToUpdate.kmsDriven = parseInt(dataToUpdate.kmsDriven, 10);
    }
    const updatedCar = await carService.updateCarById(id, dataToUpdate);
    res.status(200).json({
      success: true,
      message: "Car updated successfully.",
      data: updatedCar,
    });
  } catch (err) {
    console.error(`Failed to update car ${req.params.id}:`, err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Car not found." });
    }
    res.status(500).json({ success: false, message: "Failed to update car." });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    //Add the zod validation for bike, once prisma schema is fixed, and move validation to middleware
    const carId = parseInt(req.params.id, 10);
    if (isNaN(carId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid car ID provided." });
    }

    await carService.deleteCar(carId);

    res.status(200).json({
      success: true,
      message: "Car deleted successfully.",
    });
  } catch (err) {
    console.error("Error in deleteCar:", err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Car not found." });
    }
    res.status(500).json({ success: false, message: "Failed to delete car." });
  }
};

exports.getFilters = async (req, res) => {
  try {
    const filters = await carService.getCarFilters();
    // Cache this! Brands don't change every second. Cache for 1 hour (3600s).
    res.set("Cache-Control", "public, max-age=3600");
    res.status(200).json({ success: true, data: filters });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch filters" });
  }
};
