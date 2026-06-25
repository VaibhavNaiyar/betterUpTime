import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import v1Router from "./routes/v1/index";

const app = express();

// CORS — allow all origins
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());
app.use("/api/v1", v1Router);

app.listen(3001, () => {
  console.log("API server running on port 3001");
});
