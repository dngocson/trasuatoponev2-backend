import mongoose, { model, models, Schema } from "mongoose";
import slugify from "slugify";

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category phải có name"],
  },
  engName: {
    type: String,
  },
});

CategorySchema.pre("save", function (next) {
  this.engName = slugify(this.name, {
    lower: true,
    locale: "vi",
    replacement: " ",
    trim: true,
  });
  next();
});

CategorySchema.pre("findOneAndUpdate", function (next) {
  // Get the update operation
  const updateOperation = this.getUpdate();

  // If the name field is being updated
  // @ts-ignore
  if (updateOperation.name) {
    // Update the engName field with the new name
    // @ts-ignore
    this._update.engName = updateOperation.name;
  }
  next();
});

/////////////////////////////////////////////////////////////////////////
export const Category = models?.Category || model("Category", CategorySchema);
