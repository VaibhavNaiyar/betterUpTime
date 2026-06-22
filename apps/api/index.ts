import "dotenv/config";
import express from "express";
import v1Router from "./routes/v1/index";

const app = express();
app.use(express.json());

app.use("/api/v1", v1Router);

app.listen(3001, () => {
  console.log("API server running on port 3001");
});
