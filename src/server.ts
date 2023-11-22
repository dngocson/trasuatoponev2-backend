import app from "./app";
import { connectDatabase } from "./util/connectDatabase";

// 1. Connect to mongodb
connectDatabase();

// 2. Start server
const port = process.env.PORT || 3000;
app.listen(port);
