const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");

const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");

exports.getOverview = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Tour.find(), req.query).search();
  const tours = await features.query;

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    select: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name", 404));
  }

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findOne({ slug: req.params.slug }).populate({
  //   path: "reviews",
  //   select: "review rating user",
  // });

  res.status(200).render("login", {
    title: "Log into your account",
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("booking", {
    title: "My Tours",
    tours,
  });
});

exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Create Your Account",
  });
};

exports.getCreateNewTourForm = (req, res) => {
  res.status(200).render("createTour", {
    title: "Create New Tour",
  });
};
