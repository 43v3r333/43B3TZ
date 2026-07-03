import express from "express";
import { container } from "../core/di";
import { ResearchService } from "../services/research";
import { ResearchValidator } from "../validators/research";
import { requirePermission } from "../middleware/security";

const router = express.Router();

const getResearchService = () => container.resolve<ResearchService>("ResearchService");

// 1. Get all research experiments
router.get("/experiments", requirePermission("Research.Read"), (req, res, next) => {
  try {
    const list = getResearchService().listExperiments();
    res.json(list);
  } catch (err: any) {
    next(err);
  }
});

// 2. Trigger asynchronous background research experiments
router.post("/experiments/run", requirePermission("Research.Execute"), async (req, res, next) => {
  try {
    const validation = ResearchValidator.validateRunExperiment(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { name, description } = validation.data!;
    
    // Choose async vs sync processing based on query flag
    if (req.query.async === "false") {
      // Sync run for immediate results if desired
      const result = await (getResearchService() as any).runExperimentSync(
        `exp-${Date.now()}`,
        name,
        description
      );
      res.json(result);
    } else {
      // Asynchronous background job queue execution
      const result = await getResearchService().runExperimentAsync(name, description);
      res.status(202).json({
        success: true,
        message: "Asynchronous experiment execution enqueued successfully in background worker",
        ...result
      });
    }
  } catch (err: any) {
    next(err);
  }
});

export default router;
