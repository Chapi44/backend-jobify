const { StatusCodes } = require("http-status-codes");
const Company = require("../model/company.model");
const cloudinary = require("../config/cloudinary"); // Cloudinary config


// Create a new company
const createCompany = async (req, res) => {
  try {
    // Check if the logo file is provided
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: "Logo is required" });
    }

    // Upload the image to Cloudinary using the buffer from memory storage
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "company_logos" }, // Cloudinary folder
        (error, result) => {
          if (error) {
            return reject(error); // Handle Cloudinary upload error
          }
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer); // End the stream and pass the file buffer
    });

    // Create a new company with the uploaded logo URL
    const company = new Company({
      name: req.body.name,
      description: req.body.description,
      logo: result.secure_url, // Use the secure URL from Cloudinary
      createdBy: req.user._id, // The user creating the company
    });

    // Save the company to the database
    await company.save();

    // Respond with success
    res.status(StatusCodes.CREATED).send({
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal server error" });
  }
};

// Get all companies with pagination
const getAllCompanies = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate skip value based on page and limit
    const skip = (page - 1) * limit;

    // Fetch total number of companies
    const totalCompanies = await Company.countDocuments();

    // Fetch companies with pagination
    const companies = await Company.find()
      .skip(skip)
      .limit(limit)
      .populate("createdBy")
      .sort({ createdAt: -1 }) // Sort by newest companies first
      .lean(); // Convert results to plain JS objects

    // Send the paginated company results
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Companies fetched successfully",
      companies,
      currentPage: page,
      totalPages: Math.ceil(totalCompanies / limit),
      totalCompanies,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch companies",
    });
  }
};


// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id).populate("createdBy");

    if (!company) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Company not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Company fetched successfully",
      company,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch company",
    });
  }
};

// Update company by ID
const updateCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Upload new logo to Cloudinary if file is provided
    let logoUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.buffer, {
        folder: "company_logos",
      });
      logoUrl = result.secure_url;
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      {
        name,
        description,
        logo: logoUrl ? logoUrl : undefined, // Only update the logo if a new one is provided
      },
      { new: true } // Return the updated document
    );

    if (!updatedCompany) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Company not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to update company",
    });
  }
};

// Delete company by ID
const deleteCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Company not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to delete company",
    });
  }
};

// Search companies by name or description with pagination
const searchCompanies = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate skip value based on page and limit
    const skip = (page - 1) * limit;

    // Search term for filtering companies by name or description
    const searchTerm = req.query.search || "";

    // Build the filter object based on searchTerm
    const filter = {};
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search in the company name
        { description: { $regex: searchTerm, $options: "i" } } // Case-insensitive search in the company description
      ];
    }

    // Fetch total number of companies matching the search
    const totalCompanies = await Company.countDocuments(filter);

    // Fetch companies with pagination and search
    const companies = await Company.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("createdBy")
      .sort({ createdAt: -1 }) // Sort by newest companies first
      .lean(); // Convert results to plain JS objects

    // Send the paginated and filtered company results
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Companies fetched successfully",
      companies,
      currentPage: page,
      totalPages: Math.ceil(totalCompanies / limit),
      totalCompanies,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch companies",
    });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompanyById,
  deleteCompanyById,
  searchCompanies
};
