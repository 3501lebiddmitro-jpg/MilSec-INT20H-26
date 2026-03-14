import express from "express";
import cors from "cors";
import { runSchema } from "./infrastructure/db/client.js";
import { sessionRouter } from "./modules/session/session.routes.js";

runSchema();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api/session", sessionRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
