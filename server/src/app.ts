import express from "express";
import cors from "cors";
import { runSchema } from "./infrastructure/db/client.js";
import { sessionRouter } from "./modules/session/session.routes.js";
import { contentRouter } from "./modules/content/content.routes.js";
import { initializePublishedJourney } from "./modules/content/content.service.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

runSchema();
initializePublishedJourney();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api/session", sessionRouter);
app.use("/api/content", contentRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
