require("express-async-errors");

const cors = require("cors");
const express = require("express");
const fs = require('fs');

const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});



const morgan = require("morgan");
const cookieParser = require("cookie-parser");



const connectDB = require("./db/connect.js");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userroutes.js");
const companyRoutes= require("./routes/companyRoutes");
const jobRoutes = require("./routes/JobRoutes.js" )

// Middleware
const notFoundMiddleware = require("./middelware/not-found.js");
const errorHandlerMiddleware = require("./middelware/error-handler.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Create a write stream for morgan logs
const logDirectory = path.join(__dirname, 'logs');

// Ensure that the 'logs' directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), {
  flags: 'a', // 'a' means append to the file
});

// Set up morgan to log to both the console and the file
app.use(morgan('tiny')); // Logs to the console in 'tiny' format
// app.use(morgan('combined', { stream: accessLogStream })); // Logs detailed info to the file



app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, origin);
  },
  credentials: true
}));
// app.use(morgan("tiny"));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser(process.env.JWT_SECRET));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/job", jobRoutes);



app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // react app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}


const start = async () => {
  try {
    await connectDB(process.env.MONGO);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};


start();
