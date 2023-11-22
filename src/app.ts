import bodyParser from "body-parser";
import express from "express";

import createRouter from "./routes";
import { globalErrorHandler, handleUndefinedRoute } from "./util/appError";

// 1. MiddleWare
const app = express();
app.use(bodyParser.json());

// 2. Routes
createRouter(app);

// 3. Handler for undefined routes
app.all("*", handleUndefinedRoute);

// 4. Error handle middleWare
app.use(globalErrorHandler);
export default app;
