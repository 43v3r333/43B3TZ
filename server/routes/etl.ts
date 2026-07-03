import { Router } from "express";
import { etlStorage } from "../etl/storage/storage";
import { etlMetricsTracker } from "../etl/metrics/metrics";
import { etlAuditLogger } from "../etl/audit/audit";
import { etlDeadLetterQueue } from "../etl/deadletter/deadletter";
import { etlPipelineOrchestrator } from "../etl/pipeline/pipeline";
import { etlReplayEngine } from "../etl/pipeline/replay";
import { etlQueueWorker } from "../etl/workers/workers";
import { etlJobScheduler } from "../etl/scheduler/scheduler";
import { EntityType } from "../etl/types";
import { createLogger } from "../core/logger";

const logger = createLogger("ETLRoutes");
const router = Router();

// 1. Get storage summary stats
router.get("/storage/stats", (req, res) => {
  try {
    const stats = etlStorage.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Clear all storage
router.post("/storage/clear", (req, res) => {
  try {
    etlStorage.clearAll();
    etlMetricsTracker.clear();
    etlAuditLogger.clearLogs();
    etlDeadLetterQueue.clearQueue();
    res.json({ success: true, message: "ETL Platform databases and stats truncated successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get raw records
router.get("/storage/raw", (req, res) => {
  try {
    const records = etlStorage.getRawRecords();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get normalized records
router.get("/storage/normalized", (req, res) => {
  try {
    const records = etlStorage.getNormalizedRecords();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get curated records by type
router.get("/storage/curated/:type", (req, res) => {
  try {
    const { type } = req.params;
    const records = etlStorage.getCuratedEntities(type as EntityType);
    res.json({ success: true, type, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get metrics json
router.get("/metrics", (req, res) => {
  try {
    const stats = etlMetricsTracker.getStatsSummary();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Expose Prometheus metrics scraping text
router.get("/metrics/prometheus", (req, res) => {
  try {
    const text = etlMetricsTracker.generatePrometheusScrape();
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(text);
  } catch (err: any) {
    res.status(500).send(`# ERROR: ${err.message}`);
  }
});

// 8. Get audit logs
router.get("/audit", (req, res) => {
  try {
    const logs = etlAuditLogger.getLogs();
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Get Dead-Letter Queue
router.get("/dlq", (req, res) => {
  try {
    const entries = etlDeadLetterQueue.getQueue();
    res.json({ success: true, dlq: entries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Resolve Dead-Letter Queue entry
router.post("/dlq/resolve", (req, res) => {
  try {
    const { dlqId, reason } = req.body;
    if (!dlqId || !reason) {
      return res.status(400).json({ success: false, error: "dlqId and reason are required fields." });
    }
    const success = etlDeadLetterQueue.resolve(dlqId, reason);
    if (!success) {
      return res.status(404).json({ success: false, error: `DLQ entry with ID '${dlqId}' not found.` });
    }
    res.json({ success: true, message: `DLQ entry '${dlqId}' marked as resolved.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Remove DLQ entry
router.post("/dlq/delete", (req, res) => {
  try {
    const { dlqId } = req.body;
    const success = etlDeadLetterQueue.delete(dlqId);
    if (!success) {
      return res.status(404).json({ success: false, error: `DLQ Entry '${dlqId}' not found.` });
    }
    res.json({ success: true, message: `DLQ Entry '${dlqId}' removed successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Get current pipeline config
router.get("/config", (req, res) => {
  try {
    const config = etlPipelineOrchestrator.getConfig();
    res.json({ success: true, config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Update pipeline config
router.post("/config", (req, res) => {
  try {
    etlPipelineOrchestrator.updateConfig(req.body);
    res.json({ success: true, config: etlPipelineOrchestrator.getConfig() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Trigger historic replay
router.post("/replay", async (req, res) => {
  try {
    const filters = req.body;
    const stats = await etlReplayEngine.executeReplay(filters);
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Ingest test payload (Simulation Playground)
router.post("/ingest-test", async (req, res) => {
  try {
    const { providerName, entityType, rawPayload, operator } = req.body;
    if (!providerName || !entityType || !rawPayload) {
      return res.status(400).json({ success: false, error: "providerName, entityType, and rawPayload are required parameters." });
    }

    const result = await etlPipelineOrchestrator.process(providerName, entityType, rawPayload, operator || "user_sim");
    res.json({
      success: result.success,
      auditId: result.auditId,
      errors: result.errors
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Get background workers and scheduler logs
router.get("/workers", (req, res) => {
  try {
    res.json({
      success: true,
      workers: etlQueueWorker.getWorkerStatus(),
      tasks: etlQueueWorker.getTaskHistory(),
      schedulerJobs: etlJobScheduler.getJobs()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
