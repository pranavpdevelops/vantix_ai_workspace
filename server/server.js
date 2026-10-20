import "dotenv/config";
import express from "express";
import cors from "cors";
import{ connectDB} from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import { get } from "mongoose";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "TaskForge AI backend is running" });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer()