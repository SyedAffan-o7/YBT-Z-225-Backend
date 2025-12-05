const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const upload = require("../middleware/upload");
const validate = require("../validators/Validator");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createCarSchema,
  getCarByIdSchema,
  getCarsByDealerSchema,
  updateCarSchema,
} = require("../validators/car.validator");

router.post(
  "/",
  protect,
  admin,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
    { name: "mobileImages", maxCount: 10 },
    { name: "mobileVideos", maxCount: 5 },
  ]),
  validate(createCarSchema),
  carController.createCar
);

router.get("/latest-additions", carController.getLatestAdditions);
router.get("/filters", carController.getFilters);
router.get("/", carController.getAllCars);
router.get("/search", carController.searchCars);
router.get("/count", carController.getTotalCars);
router.get("/:id", validate(getCarByIdSchema), carController.getCarById);
router.get(
  "/dealer/:dealerId",
  validate(getCarsByDealerSchema),
  carController.getCarsByDealer
);
router.put(
  "/:id",
  protect,
  admin,
  upload.fields([{ name: "carImages", maxCount: 10 }]),
  validate(updateCarSchema),
  carController.updateCar
);
router.delete("/:id", protect, admin, carController.deleteCar);

module.exports = router;
