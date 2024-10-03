const express = require("express");
const {
  getAllUsers,
  getUserById,
  deleteuser,
  updateUser,
  updateUserPassword,
  searchUserByUsername,
  getProfileByToken,

 
} = require("../controller/usercontroller");
const {
  authMiddleware,authAuthorization
} = require("../middelware/authMiddleware");

const multerMiddleware = require("../middelware/multerSetup");

const router = express.Router();

router.get(
  "/getallusers",authMiddleware,authAuthorization(['superadmin']),
  getAllUsers
);

router.get(
  "/getuserById/:id",authMiddleware,authAuthorization(['superadmin']),
  getUserById
);
router.post(
  "/delete/:id",authMiddleware,authAuthorization(['superadmin']),
  deleteuser
);
router.patch(
  "/update/:id",
  authMiddleware,authAuthorization(['superadmin']),
  updateUser
);
router.patch(
  "/updateUserPassword/:id",authMiddleware,authAuthorization(['superadmin']),
  updateUserPassword
);



router.get("/search", authMiddleware, authMiddleware,authAuthorization(['superadmin']), searchUserByUsername);



router.get("/profile", getProfileByToken);




module.exports = router;
