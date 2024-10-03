const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJobById,
  searchJobs
} = require("../controller/jobController");
const router = express.Router();
const {authMiddleware, authAuthorization} = require("../middelware/authMiddleware"); // Assuming you have an auth middleware for protected routes

// Route to create a new job (only accessible by authenticated users, e.g., admin)
router.post("/", authMiddleware, authAuthorization(['admin', 'superadmin']), createJob);

// Route to get all jobs (public route)
router.get("/getalljobs", getAllJobs);

// Route to get a job by ID (public route)
router.get("/:id", getJobById);

// Route to update a job by ID (only accessible by authenticated users, e.g., admin)
router.put("/:id", authMiddleware, authAuthorization(['admin', 'superadmin']), updateJobById);

// Route to delete a job by ID (only accessible by authenticated users, e.g., admin)
router.delete("/:id", authMiddleware, authAuthorization(['admin', 'superadmin']), deleteJobById);
router.get("/searchjobs/search", searchJobs);

module.exports = router;
