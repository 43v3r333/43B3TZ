# ⚙️ Platform Automation & Background Task Schedules

This document details the scheduled cron jobs, event-driven pipelines, and retry mechanisms.

---

## 📅 Scheduled Background Tasks

All background jobs are orchestrated using Celery Beats and scheduled cron triggers.

| Job Description | Trigger Schedule | Action Flow | Failure Tolerance |
| :--- | :--- | :--- | :--- |
| **Odds Scraper** | Every 15 minutes | Scrape and save Betway SA and Hollywoodbets prices. | 3 retries, rotated proxies |
| **Match Calendar Sync** | Daily at 02:00 AM | Ingest scheduled match events. | Alert on Slack on failure |
| **Model Evaluator** | Weekly on Mondays | Evaluate prediction log-loss and model drift. | Automatic retraining fallback |

---

## 🛠️ Automated Alerting Flows

If a scraping run fails 3 consecutive times or model validation metrics degrade, the DevOps system instantly alerts the team via Slack webhook integrations.
