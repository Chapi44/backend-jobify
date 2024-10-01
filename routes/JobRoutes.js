const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJobById,
} = require("../controller/jobController");
const router = express.Router();
const {authMiddleware} = require("../middelware/authMiddleware"); // Assuming you have an auth middleware for protected routes

// Route to create a new job (only accessible by authenticated users, e.g., admin)
router.post("/", authMiddleware, createJob);

// Route to get all jobs (public route)
router.get("/", getAllJobs);

// Route to get a job by ID (public route)
router.get("/:id", getJobById);

// Route to update a job by ID (only accessible by authenticated users, e.g., admin)
router.put("/:id", authMiddleware, updateJobById);

// Route to delete a job by ID (only accessible by authenticated users, e.g., admin)
router.delete("/:id", authMiddleware, deleteJobById);

module.exports = router;
