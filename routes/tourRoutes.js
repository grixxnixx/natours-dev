const express = require("express");

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router({ mergeParams: true });

router.use("/:tourId/reviews", reviewRouter);

router.get("/tour-stats", tourController.getStats);
router.get("/monthly-plan/:year", tourController.getMonthlyPlan);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  )
  .patch(
    authController.protect,
    tourController.tourImageUpload,
    tourController.resizeTourImage,
    tourController.updateTour
  );

module.exports = router;
