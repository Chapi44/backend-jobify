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
      salaryRange,
      responsibilities,
      requirements,
      tags,
      Applylink

    } = req.body;

    // Create the job
    const job = await Job.create({
      title,
      description,
      company, // The ID of the company posting the job
      createdBy: req.userId, // The admin or user creating the job
      location,
      jobType,
      experienceLevel,
      salaryRange,
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
    const jobs = await Job.find().populate("company createdBy");

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch jobs" });
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

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJobById,
};
