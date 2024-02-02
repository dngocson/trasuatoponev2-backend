import menuRouter from "../routes/menuItemRoute";
import userRouter from "../routes/userRoute";
import reviewRouter from "../routes/reviewRoute";
import uploadRouter from "./uploadRoute";
import categoryRouter from "./categoryRoute";

import { Express } from "express";

function createRouter(app: Express) {
  app.use("/api/v1/menu-items", menuRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/upload", uploadRouter);
  app.use("/api/v1/category", categoryRouter);
}

/////////////////////////////////////////////////////////////////////////
export default createRouter;
