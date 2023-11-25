import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose, { model, models } from "mongoose";
import validator from "validator";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please provide emal"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phoneNumber: {
    type: String,
  },
  image: {
    type: String,
  },
  city: {
    type: String,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  password: {
    type: String,
    required: [true, "Pleave provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a confirm password"],
    validate: {
      validator: function (el: string) {
        // @ts-ignore
        return el === this.password;
      },
      message: "Password and PasswordConfirm is not the same",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  refreshToken: {
    type: [String],
  },
});

///////////////////////////////////////////////////////////////////////////////////////////
// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // @ts-ignore
  this.passwordConfirm = undefined;
  next();
});

///////////////////////////////////////////////////////////////////////////////////////////
// Add check function to UserSchema
UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

///////////////////////////////////////////////////////////////////////////////////////////
// Check if the user changed their password after the JWT token was issued.
UserSchema.methods.changedPasswordAfter = function (JWTIssuedTime: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );
    return JWTIssuedTime < changedTimestamp;
  }
  return false;
};

///////////////////////////////////////////////////////////////////////////////////////////
// Generate random reset token for reset password feature
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 60 * 15 * 1000;
  return resetToken;
};

///////////////////////////////////////////////////////////////////////////////////////////
// Save time Password was changed
UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // @ts-ignore
  this.passwordChangedAt = Date.now() - 2000;
  next();
});

///////////////////////////////////////////////////////////////////////////////////////////
// Unselect Inactive user
UserSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.find({ active: true });
  next();
});

/////////////////////////////////////////////////////////////////////////
export const User = models?.User || model("User", UserSchema);
