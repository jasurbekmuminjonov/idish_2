const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "seller"],
    default: "seller",
  },
  success: {
    xisobot: { type: Boolean, default: false },
    qarzdorlar: { type: Boolean, default: false },
    xarajatlar: { type: Boolean, default: false },
    skaladorlar: { type: Boolean, default: false },
    vazvratlar: { type: Boolean, default: false },
    adminlar: { type: Boolean, default: false },
    sotuv_tarixi: { type: Boolean, default: false },
    dokon: { type: Boolean, default: false },
    SalesStatistics: { type: Boolean, default: false },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
