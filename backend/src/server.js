import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 
import { initDB } from "./config/db.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import authRoute from "./routes/authRoute.js"; 

dotenv.config();

const app = express();

// middleware
app.use(cors()); 
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Hook up the routes
app.use("/api/transactions", transactionsRoute);
app.use("/api/auth", authRoute); 

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});