import mongoose, { model, models } from "mongoose";
import { MenuItem } from "./menuItemModel";

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
///////////////////////////////////////////////////////////////////////////////////////////
// 2. Calulate review with Static methods
ReviewSchema.statics.calcAverageRatings = async function (menuItemId) {
  const stats = await this.aggregate([
    { $match: { menuItem: menuItemId } },
    {
      $group: {
        _id: "$menuItem",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await MenuItem.findByIdAndUpdate(menuItemId, {
    ratingsQuantity: stats[0].nRating || 0,
    ratingsAverage: stats[0].avgRating || 0,
  });
};

ReviewSchema.post("save", function () {
  // @ts-ignore
  this.constructor.calcAverageRatings(this.menuItem);
});

ReviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.menuItem);
});

ReviewSchema.index({ menuItem: 1, user: 1 }, { unique: true });

/////////////////////////////////////////////////////////////////////////
export const Review = models?.Review || model("Review", ReviewSchema);
