import bodyParser from "body-parser";
import express from "express";
import createRouter from "./routes";
import { globalErrorHandler, handleUndefinedRoute } from "./util/appError";
import { appSettings } from "./util/appSetting";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
// @ts-ignore
import { xss } from "express-xss-sanitizer";
import hpp from "hpp";

// 1. MiddleWare
const app = express();
// A. Set security HTTP header
app.use(helmet());

// B. Limit API request
app.use("/api", appSettings.limiter);

// C. Parse and limit req.body and
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1kb" }));
app.use(xss());

// D. Data sanitization
app.use(ExpressMongoSanitize());

// E. Prevent parameter pollution
app.use(hpp({ whitelist: ["price"] }));

// 2. Routes
createRouter(app);

// 3. Handler for undefined routes
app.all("*", handleUndefinedRoute);

// 4. Error handle middleWare
app.use(globalErrorHandler);
export default app;
