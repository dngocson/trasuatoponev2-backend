import menuRouter from "../routes/menuItemRoute";
import userRouter from "../routes/userRoute";
import { Express } from "express";

function createRouter(app: Express) {
  app.use("/api/v1/menu-items", menuRouter);
  app.use("/api/v1/users", userRouter);
}
export default createRouter;
