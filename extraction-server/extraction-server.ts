import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { ChatCompletionClient } from "../server/ChatCompletionClient";
import { createDefsRouter } from "./defs-router";
import { DefsDatabase } from "./memory-database";
config();

const port = process.env.PORT ?? 8080;

const app = express();

app.use(cors());
app.use(express.json());

async function startServer() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const PG_URL = process.env.PG_URL;
  if (!PG_URL) {
    throw new Error("Missing PG_URL");
  }

  const defsDatabase = new DefsDatabase();
  const client = new ChatCompletionClient({
    apiKey,
    model: "gpt-4",
  });
  const defsRouter = await createDefsRouter({
    client,
    defsDatabase,
  });

  // use express router, defsRouter
  app.use("/api/defs", defsRouter);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  return app;
}

startServer();
