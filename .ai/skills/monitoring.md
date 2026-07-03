# 📊 System Monitoring & Alerting Standards

## 1. Purpose
To establish active telemetry, metrics tracking, and error-alert mechanisms across production services.

## 2. When to Use
- Tracking API response times, memory consumption, queue rates, and error rate triggers.

## 3. When NOT to Use
- Writing local verification scripts or single-run unit tests.

## 4. Architecture
```
[ Platform Services ] ---> [ Prometheus Metrics Engine ] ---> [ Grafana Dashboard ] ---> [ Alerting Gateways ]
```

## 5. Step-by-Step Implementation
1. **Instrument Metrics**: Expose standard metrics (/metrics) for scraper ingestion.
2. **Define Gauges & Counters**: Monitor error counters, transaction volumes, and system CPU.
3. **Setup Alerts**: Set threshold alarms on high latency (e.g., >500ms) or high exception counts.

## 6. Repository Standards
- Monitor all core database connection pool sizes at all times.
- Keep monitoring libraries isolated from core domain calculations.

## 7. Examples

### Exposing Metrics endpoint in FastAPI
```python
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI()

# Simple global metrics collection
REQUEST_COUNT = 0

@app.middleware("http")
async def count_requests_middleware(request, call_next):
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    return await call_next(request)

@app.get("/metrics", response_class=PlainTextResponse)
def metrics_endpoint():
    return f"platform_http_requests_total {REQUEST_COUNT}\n"
```

## 8. Best Practices
- Standardize on Golden Signals: Latency, Traffic, Errors, Saturation.
- Ensure alerts are actionable with detailed remediation guidelines.

## 9. Anti-patterns
- **Alert Fatigue**: Triggering alarms on minor, non-actionable warning thresholds.

## 10. Security Considerations
- Restrict access to metrics endpoints strictly to authorized telemetry scrapers.

## 11. Performance Considerations
- Ensure metrics increments are non-blocking and use fast in-memory variables.

## 12. Testing Strategy
- Verify metrics registries are incremented correctly when specific APIs are called.

## 13. Review Checklist
- [ ] Are all core external APIs wrapped in latency measurement metrics?
- [ ] Is access to the metrics endpoints restricted?

## 14. Common Mistakes
- Forgetting to monitor Celery queue backup counts, resulting in undetected processing backlogs.

## 15. Future Improvements
- Build predictive alert thresholds based on historic database load patterns.

## 16. Revision History
- **v1.0.0**: Established telemetry monitoring guidelines.

## 17. Related References
- Skills: [Logging](logging.md)
