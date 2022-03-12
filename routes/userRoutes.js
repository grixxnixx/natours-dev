const express = require("express");
const userController = require("../controllers/userController");


const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/logout", authController.logout);


router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:resetToken", authController.resetPassword);

router.patch(
  "/updateMe",
  authController.protect,
  userController.userPhotoUpload,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router.use(authController.protect);

router.route("/").get(userController.getAllUsers);
// .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .delete(
    authController.restrictTo("admin", "user"),
    userController.deleteUser
  );

module.exports = router;
