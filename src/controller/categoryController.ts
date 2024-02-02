import { z } from "zod";
import { Category } from "../model/categoryModel";
import { handleFactory } from "./handleFactory";

const { deleteOne, updateOne, createOne, getOneById, getAllDoc } =
  handleFactory;

///////////////////////////////////////////////////////////////////////////////////////////
// 1. Get all Category
const getAllCategory = getAllDoc(Category, "Category");

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Get a Category
const getCategory = getOneById(Category, "Category");

///////////////////////////////////////////////////////////////////////////////////////////
// 3. Create a new Category
const ZodCreateAndEditCategorySchema = z.object({
  name: z.string(),
});
const createnewCategory = createOne(
  Category,
  ZodCreateAndEditCategorySchema,
  "Category"
);

///////////////////////////////////////////////////////////////////////////////////////////
// 4. Delete a Category
const deleteCategory = deleteOne(Category);

///////////////////////////////////////////////////////////////////////////////////////////
// 5. Update Category

const updateCategory = updateOne(Category, ZodCreateAndEditCategorySchema);

///////////////////////////////////////////////////////////////////////////////////////////
export const categoryControllers = {
  getAllCategory,
  getCategory,
  createnewCategory,
  deleteCategory,
  updateCategory,
};
