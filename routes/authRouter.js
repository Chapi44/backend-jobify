const express = require("express");
const router = express.Router();

const {
  register,
  signin,
  logout,
  forgotPassword,
  ResetPassword,

} = require("../controller/authController");


router.post("/register", register);


router.post("/login", signin);


router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", ResetPassword);

module.exports = router;
