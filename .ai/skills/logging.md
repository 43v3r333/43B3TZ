# 📝 Application Logging Standards

## 1. Purpose
To define unified logging standards to ensure rapid troubleshooting, monitoring, and audit compliance.

## 2. When to Use
- Recording execution milestones, tracing warnings, and logging exceptions across all modules.

## 3. When NOT to Use
- Storing temporary developer print lines (which must be removed before code reviews).

## 4. Architecture
```
[ Logger Event ] ---> [ Standard Formatter (JSON) ] ---> [ Transport / Console ] ---> [ Analytics Engine ]
```

## 5. Step-by-Step Implementation
1. **Choose Level**: Select appropriate levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).
2. **Format as JSON**: Use structured JSON formats for all output streams.
3. **Include Context**: Add request IDs, user context, and transaction indicators.

## 6. Repository Standards
- Standard outputs must use designated logging objects; never use raw `print()` or `console.log()`.
- All exception log events must include active trace-back details.

## 7. Examples

### Structured Logger Config in Python
```python
import logging
import json
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_payload: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_payload)

logger = logging.getLogger("platform")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

## 8. Best Practices
- Keep INFO level logs clear, concise, and focused strictly on high-level operational events.
- Utilize transaction IDs to trace requests completely across multi-service boundaries.

## 9. Anti-patterns
- **Sensitive Log Leaks**: Writing passwords, API tokens, or credit cards to plaintext console buffers.

## 10. Security Considerations
- Sanitize log parameters to prevent security log injection or spoofing risks.

## 11. Performance Considerations
- Use asynchronous log output structures to prevent thread blocks on disk I/O.

## 12. Testing Strategy
- Test custom logger handlers by asserting matching keys in generated JSON streams.

## 13. Review Checklist
- [ ] Are all log lines structured as compliant JSON records?
- [ ] Have all raw `print` or `console.log` statements been removed?

## 14. Common Mistakes
- Logging voluminous DEBUG info in production setups, filling disk spaces rapidly.

## 15. Future Improvements
- Streamline ingestion directly to central tracing setups (OpenTelemetry).

## 16. Revision History
- **v1.0.0**: Defined base application logging standards.

## 17. Related References
- Skills: [Debugging](debugging.md), [Monitoring](monitoring.md)
