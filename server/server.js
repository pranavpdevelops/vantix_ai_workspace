import "dotenv/config";
import express from "express";
import cors from "cors";
import{ connectDB} from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import { get } from "mongoose";
import router from "./routes/projectroutes.js";
import taskroutes from "./routes/taskroutes.js"
import ai from "./routes/airoutes.js"
import adminroute from "./routes/adminroutes.js"
import communityRoutes from "./routes/communityroutes.js";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://vantix-ai-workspace.vercel.app",
    ],
    credentials: true,
  })
);use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "TaskForge AI backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects",router);
app.use("/api/tasks",taskroutes)
app.use("/api/ai",ai)
app.use("/api/admin",adminroute);
app.use("/api/community", communityRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer()