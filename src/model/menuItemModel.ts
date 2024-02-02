import mongoose, { model, models, Schema } from "mongoose";
import slugify from "slugify";

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
    engName: {
      type: String,
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
    ratingsAverage: {
      type: Number,
      set: (val: number) => val.toFixed(2),
    },
    ratingsQuantity: {
      type: Number,
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
// 1. Get user comments with Virtual populate
MenuItemSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "menuItem",
  localField: "_id",
});

// 2. Document middleWare
MenuItemSchema.pre("save", function (next) {
  this.engName = slugify(this.name, {
    lower: true,
    locale: "vi",
    replacement: " ",
    trim: true,
  });
  next();
});

// 2. Set index
MenuItemSchema.index({ basePrice: 1 });
/////////////////////////////////////////////////////////////////////////
export const MenuItem = models?.menuitem || model("MenuItem", MenuItemSchema);

///////////////////////////////////////////
// EMBEDED IN MONGOSE
// Schema.pre('save',async function(next){
//   const variablePromises = this.variable.map(async referenceId => await referenceSchema.findById(referenceId))
//   this.variable = await Promise.all(variablePromises)
//   next()
// })

// MenuItemSchema.virtual("TestingField").get(function () {
//   return this.name.toUpperCase();
// });
