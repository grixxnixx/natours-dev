const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");
const factory = require("./handleFactory");

exports.setTourAndUserIds = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
// exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  await Review.calcRatingsAverage(review.tour);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
