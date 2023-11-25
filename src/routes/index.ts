import menuRouter from "../routes/menuItemRoute";
import userRouter from "../routes/userRoute";
import reviewRouter from "../routes/reviewRoute";
import { Express } from "express";

function createRouter(app: Express) {
  app.use("/api/v1/menu-items", menuRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/reviews", reviewRouter);
}

/////////////////////////////////////////////////////////////////////////
export default createRouter;
