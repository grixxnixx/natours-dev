const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const User = require("../models/userModel");
const sendEmail = require("../utils/email");

const signtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};

const sendResponse = (user, res, statusCode) => {
  const token = signtoken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  sendResponse(newUser, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  // Get email and password
  const { email, password } = req.body;

  // Check email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide your email and password", 404));
  }

  // Check user is exist and password is currect
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 400));
  }

  // send response to the client
  sendResponse(user, res, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in please log into your account.", 401)
    );
  }
  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check user is exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("This token belonging user is n longer exist", 401)
    );
  }
  // Send res to the client
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check user is exist
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }
      // Send res to the client
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }

  next();
};

exports.logout = (req, res) => {
  // res.cookie("jwt", "loggedout", {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collections
  const user = await User.findById(req.user.id).select("+password");

  // Check passwords are currect
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is incorrect", 401));
  }
  // If so, the Update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //Send response

  sendResponse(user, res, 200);
});

exports.restrictTo = (...roles) => {
  // if(roles.includes())
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You don't have any permission to perform this action`,
          403
        )
      );
    }
    next();
  };
};

// exports.fotgotPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });
//   // Check requested email is exist
//   if (!user) {
//     return next(new AppError("There is no user with that email address", 404));
//   }

//   // Generate random token
//   const resetToken = user.createResetToken();

//   await user.save({ validateBeforeSave: false });

//   const url = `${req.protocol}://${req.get(
//     "host"
//   )}/api/v1/users/resetToken/${resetToken}`;
//   console.log(url);

//   const message = `Your password reset token.. Submit a patch request this url ${url} \n If you did't forgot your password, then ignore it.`;

//   console.log(message);

//   // send it to email
//   try {
//     await sendEmail({
//       email: user._id,
//       message,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email",
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetTokenExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(new AppError("There is error sending an email", 500));
//   }

//   // send response
// });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // Genarate Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send email

  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetToken/${resetToken}`;

  const message = `Your password reset token.. Submit a patch request this url ${url} \n If you did't forgot your password, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent succussfully!",
    });
  } catch (err) {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
    return next(new AppError("There is error sending an email", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on req.params

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({ passwordResetToken: hashedToken });

  if (!user) {
    return next(new AppError("Token is invalid or expired!", 400));
  }
  // Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // Send response
  sendResponse(user._id, res, 200);
});
