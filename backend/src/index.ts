import express from "express";
import dotenv from "dotenv";
import { router as jobRouter } from "./routes/jobs.route";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // need to be changed in prod
  })
);

app.use("/api/v1", jobRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
