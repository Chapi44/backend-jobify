const { StatusCodes } = require("http-status-codes");
const Job = require("../model/job.model");

// Create a new Job

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      responsibilities,
      requirements,
      tags,
      Applylink
    } = req.body;

    // Create the job with min and max salary
    const job = await Job.create({
      title,
      description,
      company, // The ID of the company posting the job
      createdBy: req.userId, // The admin or user creating the job
      location,
      jobType,
      experienceLevel,
      minSalary, // Updated to numeric minSalary
      maxSalary, // Updated to numeric maxSalary
      responsibilities,
      requirements,
      tags, // Optional
      Applylink
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to create job" });
  }
};

// Get all Jobs
const getAllJobs = async (req, res) => {
  try {
    // Parse query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Calculate skip value based on page and limit
    const skip = (page - 1) * limit;

    // Filter parameters from the query
    const { location, company, salaryRange, jobType } = req.query;

    // Construct the filtering object
    const filter = {};

    // Add filters if they are provided in the query
    if (location) filter.location = location;
    if (company) filter.company = company; // Company should be the ObjectId or company name, depending on your schema
    if (jobType) filter.jobType = jobType;

    // Salary range filtering
    if (salaryRange) {
      const [minSalary, maxSalary] = salaryRange.replace(/,/g, '').split('-').map(Number); // Convert string to numbers
      filter.minSalary = { $gte: minSalary };
      filter.maxSalary = { $lte: maxSalary };
    }

    // Fetch total number of jobs matching the filter
    const totalJobs = await Job.countDocuments(filter);

    // Fetch jobs with pagination, sorting, and filtering
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest jobs first
      .skip(skip)
      .limit(limit)
      .populate({
        path: "company",
        select: "name logo", // Select only the necessary fields from the company
      })
      .populate({
        path: "createdBy",
        select: "name email", // Select only necessary fields from the user who created the job
      })
      .lean(); // Convert the results to plain JS objects for easier manipulation

    // Send the paginated and filtered job results
    res.status(StatusCodes.OK).json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};


// Get Job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("company createdBy");

    if (!job) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Job not found" });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch job" });
  }
};


// Update Job by ID
const updateJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      jobType,
      experienceLevel,
      salaryRange,
      responsibilities,
      requirements,
      tags,
      Applylink
  
    } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        title,
        description,
        location,
        jobType,
        experienceLevel,
        salaryRange,
        responsibilities,
        requirements,
        tags, // Optional
        Applylink

      },
      { new: true } // Return the updated document
    );

    if (!updatedJob) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Job not found" });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update job" });
  }
};

// Delete Job by ID
const deleteJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Job not found" });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to delete job" });
  }
};


const searchJobs = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    // Basic text search on title and description fields
    const jobs = await Job.find({
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    }).populate("company createdBy");

    return res.status(StatusCodes.OK).json(jobs);
  } catch (error) {
    console.error("Error searching jobs:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to search jobs",
    });
  }
};



module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJobById,
  searchJobs
};
