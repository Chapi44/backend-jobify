const express = require("express");
const router = express.Router();

const {
  register,
  signin,
  logout,
  forgotPassword,
  ResetPassword,
  registeruser

} = require("../controller/authController");
const {
  authMiddleware,authAuthorization
} = require("../middelware/authMiddleware");


router.post("/register", authMiddleware,authAuthorization(['superadmin']), register);

router.post("/registeruser", registeruser);



router.post("/login", signin);


router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", ResetPassword);

module.exports = router;
