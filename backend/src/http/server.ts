import express from "express";
import cors from "cors";
import { env } from "../config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export function startServer() {
  app.listen(env.port, () => {
    console.log(`API server listening on port ${env.port}`);
  });
}

