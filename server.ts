import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createLogger } from "./server/core/logger";
import businessRouter from "./server/routes/business";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const logger = createLogger("HTTPServer");

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "4.0.0-PRO" });
  });

  app.use("/api/v1/business", businessRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
