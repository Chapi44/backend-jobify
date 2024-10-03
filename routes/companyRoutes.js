const express = require("express");
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompanyById,
  deleteCompanyById,
  searchCompanies
} = require("../controller/companyController");
const { uploadSingleImage } = require("../middelware/fileupload"); // File upload middleware
const {authMiddleware, authAuthorization} = require("../middelware/authMiddleware"); // Authentication middleware

const router = express.Router();

// Route to create a new company (with logo upload)
router.post("/", authMiddleware, authAuthorization(['admin', 'superadmin']), uploadSingleImage, createCompany);

// Route to get all companies
router.get("/", getAllCompanies);

// Route to get a company by ID
router.get("/:id", getCompanyById);

// Route to update a company by ID (with optional logo upload)
router.put("/:id", authMiddleware, authAuthorization(['admin', 'superadmin']), uploadSingleImage, updateCompanyById);

// Route to delete a company by ID
router.delete("/:id", authMiddleware, authAuthorization(['admin', 'superadmin']),deleteCompanyById);

router.get("/companies/search", searchCompanies);

module.exports = router;
