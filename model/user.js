const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  password: { type: String },
  role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" }, 
  country: { type: String },
  city: { type: String },
  educationLevel: { type: String },
  dateOfBirth: { type: String },

});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
