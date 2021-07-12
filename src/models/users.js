const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    permissions: { type: Array, default: ["user"] },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    resetToken: { type: String },
    resetExpires: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  const hash = await bcrypt.hash(user.password, 10);

  user.password = hash;
  next();
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
