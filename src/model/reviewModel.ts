import mongoose, { model, models } from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review không thể để trống"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    menuItem: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
      required: [true, "Review cần thuộc về 1 menu nhất định"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Review cần thuộc về 1 user nhất định"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

///////////////////////////////////////////////////////////////////////////////////////////
// 1. Populate user and menuItem using query middleware
ReviewSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.populate({ path: "user", select: "name" });

  next();
});

export const Review = models?.Review || model("Review", ReviewSchema);
