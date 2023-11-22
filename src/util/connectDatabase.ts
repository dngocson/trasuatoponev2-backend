import mongoose from "mongoose";
import validatedENV from "./processEnvironment";

export function connectDatabase() {
  // 1. Get ENV variable
  const DB_URL = validatedENV.DATABASE;
  const DB_PASSWORD = validatedENV.DATABASE_PASSWORD;
  const DB_CONNECTLINK = DB_URL.replace("<PASSWORD>", DB_PASSWORD);

  // 2.Connect to database
  async function dbConnect() {
    await mongoose.connect(DB_CONNECTLINK);
  }
  dbConnect().catch((err) => console.log(err));
}
