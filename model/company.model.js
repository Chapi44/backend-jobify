const mongoose = require('mongoose');

// Define Company Schema
const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    logo: {
        type: [String], // URL or file path for the company logo
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Only admins or super-admins can create companies
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
