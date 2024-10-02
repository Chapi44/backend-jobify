const mongoose = require('mongoose');

// Define Job Schema
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true, // The company that is posting the job
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // The user/admin who created the job
    },
    location: {
        type: String, // Job location (e.g., San Francisco, CA)
        required: true,
    },
    jobType: {
        type: String, // Job type (e.g., Full-Time, Part-Time, Contract)
        required: true,
    },
    experienceLevel: {
        type: String, // Required experience (e.g., 5+ years)
        required: true,
    },
    minSalary: {
        type: Number, // Minimum salary (numeric field for easier filtering)
        required: true,
    },
    maxSalary: {
        type: Number, // Maximum salary (numeric field for easier filtering)
        required: true,
    },
    responsibilities: {
        type: [String], // An array of responsibilities for the job
        required: true,
    },
    tags: [String], 
    requirements: {
        type: [String], // An array of job requirements
        required: true,
    },
    Applylink:{
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
