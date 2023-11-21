import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";

dotenv.config({ path: "./config.env" });
const DB_URL = process.env.DATABASE!;
const DB_PASSWORD = process.env.DATABASE_PASSWORD!;
const DB_CONNECTLINK = DB_URL.replace("<PASSWORD>", DB_PASSWORD);

async function dbConnect() {
  await mongoose.connect(DB_CONNECTLINK);
}
dbConnect().catch((err) => console.log(err));

const port = process.env.PORT || 3000;
app.listen(port);
