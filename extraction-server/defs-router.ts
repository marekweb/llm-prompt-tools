import { StructuredDataDefinition } from "../common/StructuredDataDefinition";
import { ChatCompletionClient } from "../server/ChatCompletionClient";
import { StructuralExtractor } from "./StructuralExtractor";
import { DefsDatabase } from "./memory-database";
import express from "express";

interface DefsRouterConfig {
  client: ChatCompletionClient;
  defsDatabase: DefsDatabase;
}

export function createDefsRouter(config: DefsRouterConfig) {
  const { client, defsDatabase } = config;
  const router = express.Router();

  router.get("/", async (req, res) => {
    const defs = await defsDatabase.getAll();
    res.send(defs);
  });

  router.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      res.status(400).send("Missing or invalid def id");
      return;
    }
    const def = await defsDatabase.get(id);
    if (!def) {
      res.status(404).send("Def not found");
      return;
    }
    res.send(def);
  });

  router.post("/", async (req, res) => {
    // Create new
    const def = req.body as StructuredDataDefinition;
    if (!def) {
      res.status(400).send("Missing def");
      return;
    }
    const created = await defsDatabase.create(def);
    res.send(created);
  });

  // Update
  router.post("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      res.status(400).send("Missing or invalid def id");
      return;
    }
    const def = req.body as StructuredDataDefinition;
    if (!def) {
      res.status(400).send("Missing def");
      return;
    }
    const updated = await defsDatabase.update(id, def);
    res.send(updated);
  });

  router.post("/:id/extract", async (req, res) => {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      console.log(`Def was ${JSON.stringify(id)}`);
      res.status(400).send("Missing or invalid def id");
      return;
    }

    const def = await defsDatabase.get(id);
    if (!def) {
      res.status(404).send("Def not found");
      return;
    }

    const unstructuredInput = req.body.input;
    if (!unstructuredInput) {
      res.status(400).send("Missing input");
      return;
    }
    const extractor = new StructuralExtractor(client, def.fields);

    const result = await extractor.extract(unstructuredInput);
    res.send({ result });
  });

  return router;
}
