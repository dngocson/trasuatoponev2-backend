import mongoose, { model, models, Schema } from "mongoose";

const ExtraPriceSchema = new Schema({
  name: String,
  price: Number,
});

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A menu item must have a name "],
      unique: [true, "A menu item must have a unique name"],
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "A description item must have a name "],
      unique: [true, "A description item must have a unique name"],
      maxlength: [
        40,
        "A description must have less or equal then 40 characters",
      ],
      minlength: [
        10,
        "A description must have more or equal then 10 characters",
      ],
    },
    category: { type: mongoose.Types.ObjectId },
    basePrice: { type: Number },
    sizes: { type: [ExtraPriceSchema] },
    extraIngredientPrices: { type: [ExtraPriceSchema] },
  },
  { timestamps: true }
);

export const MenuItemModel =
  models?.MenuItem || model("MenuItem", MenuItemSchema);
