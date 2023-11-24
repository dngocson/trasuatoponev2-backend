import mongoose, { model, models, Schema } from "mongoose";

const ExtraPriceSchema = new Schema({
  name: String,
  price: Number,
});

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu phải có tên"],
      unique: [true, "Tên menu không được trùng"],
    },
    basePrice: { type: Number, required: [true, "Menu phải có giá niêm yết"] },
    description: {
      type: String,
      required: [true, "Menu phải có mô tả "],
      maxlength: [200, "Mô tả phải ít hơn 40 kí tự"],
      minlength: [10, "Mô tả phải nhiều hơn 10 kí tự"],
    },
    category: {
      type: String,
      required: [true, "Menu phải thuộc về một category"],
    },
    image: {
      type: String,
    },
    sizes: { type: [ExtraPriceSchema] },
    extraIngredient: { type: [ExtraPriceSchema] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
///////////////////////////////////////////////////////////////////////////////////////////
// MenuItemSchema.virtual("TestingField").get(function () {
//   return this.name.toUpperCase();
// });

// 1. Get user comments with Virtual populate
MenuItemSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "menuItem",
  localField: "_id",
});
export const MenuItem = models?.menuitem || model("MenuItem", MenuItemSchema);

///////////////////////////////////////////
// EMBEDED IN MONGOSE
// Schema.pre('save',async function(next){
//   const variablePromises = this.variable.map(async referenceId => await referenceSchema.findById(referenceId))
//   this.variable = await Promise.all(variablePromises)
//   next()
// })
