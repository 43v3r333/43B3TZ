
import express from "express";
import { DecisionOrchestrator } from "../decision/orchestrator/orchestrator";

const router = express.Router();
const orchestrator = new DecisionOrchestrator();

router.post("/run", async (req, res) => {
  try {
    const result = await orchestrator.runDecision(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
