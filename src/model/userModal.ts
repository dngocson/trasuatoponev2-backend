import mongoose, { model, models } from "mongoose";
import bcrypt from "bcryptjs";
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
      message: "Password and ConfirmPassword is not the same",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // @ts-ignore
  this.passwordConfirm = undefined;
  next();
});

// Add check function to UserSchema
UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

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

export const UserModel = models?.user || model("user", UserSchema);
