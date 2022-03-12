const express = require("express");
const viewController = require("../controllers/viewController");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(
    bookingController.createBooking,
    authController.isLoggedIn,
    viewController.getOverview
  );

router
  .route("/tour/:slug")
  .get(authController.isLoggedIn, viewController.getTour);

router.get("/login", authController.isLoggedIn, viewController.getLoginForm);
router.get("/signup", authController.isLoggedIn, viewController.getSignupForm);

router.get(
  "/create-tour",
  authController.isLoggedIn,
  viewController.getCreateNewTourForm
);

router.get("/me", authController.protect, viewController.getMe);

router.get("/my-bookings", authController.protect, viewController.getMyTours);

module.exports = router;
