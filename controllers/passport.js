const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

exports.passportJs = () =>
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      function(accessToken, refreshToken, profile, cb) {
        // User.findOrCreate({ googleId: profile.id }, function(err, user) {
        //   return cb(err, user);
        // });
        console.log(profile);
      }
    )
  );
