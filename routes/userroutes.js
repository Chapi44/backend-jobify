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
  "/getallusers",authMiddleware,authAuthorization('superadmin'),
  getAllUsers
);

router.get(
  "/getuserById/:id",
  getUserById
);
router.post(
  "/delete/:id",
  deleteuser
);
router.patch(
  "/update/:id",
  authMiddleware,
  updateUser
);
router.patch(
  "/updateUserPassword/:id",
  updateUserPassword
);



router.get("/search", authMiddleware, searchUserByUsername);



router.get("/profile", getProfileByToken);




module.exports = router;
