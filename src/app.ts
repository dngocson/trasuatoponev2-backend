import express from "express";
import bodyParser from "body-parser";
import menuRouter from "./routes/menuItem";
// 1. MiddleWare
const app = express();
app.use(bodyParser.json());

// 2. Routes
app.use("/api/v1/menu-items", menuRouter);
export default app;
