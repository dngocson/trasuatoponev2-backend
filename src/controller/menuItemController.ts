import { z } from "zod";
import { MenuItem } from "../model/menuItemModel";
import { handleFactory } from "./handleFactory";

const { deleteOne, updateOne, createOne, getOneById, getAllDoc } =
  handleFactory;

///////////////////////////////////////////////////////////////////////////////////////////
const ZodCreateMenuSchema = z.object({
  name: z.string(),
  basePrice: z.number(),
  description: z.string().min(10).max(200),
  category: z.string(),
  image: z.string(),
  sizes: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .optional(),
  extraIngredient: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .optional(),
});

///////////////////////////////////////////////////////////////////////////////////////////
// 1. Get all menu item
const getAllMenuItems = getAllDoc(MenuItem, "Menu");

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Create a menu item
const createMenuItem = createOne(MenuItem, ZodCreateMenuSchema, "Menu");

///////////////////////////////////////////////////////////////////////////////////////////
// 3. Get a specific menu item
const getMenuItem = getOneById(MenuItem, "Menu", { path: "reviews" });

///////////////////////////////////////////////////////////////////////////////////////////
// 4. Update an menu item
const ZodUpdateMenuSchema = ZodCreateMenuSchema.partial();
const updateMenuItem = updateOne(MenuItem, ZodUpdateMenuSchema);

///////////////////////////////////////////////////////////////////////////////////////////
// 5. Delete an menu item
const deleteMenuItem = deleteOne(MenuItem);

///////////////////////////////////////////////////////////////////////////////////////////
export const menuControllers = {
  getAllMenuItems,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
