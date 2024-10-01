const User = require("../model/user");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

require("dotenv").config();


const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { role } = req.query;

    const filter = {};


    if (role) filter.role = role;

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter, { password: 0 })
      .select("name phoneNumber email role")
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
  

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch posts created by the user
    const userPosts = await Product.find({ user: userId });

    // Attach the posts to the user object
    user.posts = userPosts;

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


const deleteuser = async (req, res) => {
  try {
    const { id } = req.params;
    const finduser = await User.findByIdAndDelete({ _id: id });
    if (!finduser) {
      return res.status(400).json({ error: "no such user found" });
    }
    return res.status(200).json({ message: "deleted sucessfully" });
  } catch (error) {
    res.status(500).json({ error: "something went wrong" });
  }
};




const updateUser = async (req, res) => {
  try {
    const userId = req.params.id; // Extract user ID from request parameters
    const { name, email, phoneNumber, country, city, academicLevel, dateOfBirth } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
    }

    // Optional: Check if the new email or phoneNumber already exists in another account
    const emailAlreadyExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailAlreadyExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Email already exists" });
    }
    const phoneNumberAlreadyExists = await User.findOne({ phoneNumber, _id: { $ne: userId } });
    if (phoneNumberAlreadyExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Phone number already exists" });
    }

    // Update the user's details with the provided data
    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.country = country || user.country;
    user.city = city || user.city;
    user.academicLevel = academicLevel || user.academicLevel;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;

    // Save the updated user
    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};


const updateUserPassword = async (req, res) => {
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values");
  }
  const user = await User.findById(userId);

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};



const searchUserByUsername = async (req, res) => {
  try {
    let { username, fullname } = req.query;

    if (!username && !fullname) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Username or fullname parameter is required" });
    }

    let query = {};

    if (username) {
      query.username = { $regex: new RegExp(username, "i") }; // Search by username
    }

    if (fullname) {
      query.name = { $regex: new RegExp(fullname, "i") }; // Search by fullname
    }

    // Search users by username or fullname using case-insensitive regex
    const users = await User.find(query)
      .select("name username bio profession pictures email role");

    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.error("Error searching user by username or fullname:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};



const getProfileByToken = async (req, res) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Bearer Token not provided" });
  }

  const token = bearerToken.split(" ")[1]; // Extract token from "Bearer <token>" format

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
    }

    // Return only public profile information, excluding sensitive fields
    const userProfile = {
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
      bio: user.bio,
      pictures: user.pictures,
      profession: user.profession
    };

    return res.status(StatusCodes.OK).json({ userProfile });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Token expired" });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid token" });
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  deleteuser,
  updateUser,
  searchUserByUsername,
  updateUserPassword,
  getProfileByToken,
};
