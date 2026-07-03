# 🐳 Docker Containerization Standards

## 1. Purpose
To define enterprise-grade container patterns for secure, small, and highly optimized services.

## 2. When to Use
- Packaging API controllers, database migrations, scrapers, and frontend pages for development or production environments.

## 3. When NOT to Use
- Packaging rapid local mathematical validation scripts with zero dependencies.

## 4. Architecture
We use multi-stage Docker builds to separate dependencies, compilation, and lightweight execution runtimes:
```
[ Development Stage ] -> [ Compilation/Build Stage ] -> [ Minimal Production Stage ]
(Installs dev tools)       (Compiles assets/code)        (Super small runtime image)
```

## 5. Step-by-Step Implementation
1. **Choose Base Image**: Use trusted, small, and pinned versions (e.g. `python:3.11-slim`, `node:20-alpine`).
2. **Structure Stages**: Copy package specs, install dependencies, and build target files.
3. **Declare Permissions**: Always run app operations as a non-root user.
4. **Expose Ports**: Standardize API gateway container maps to **Port 3000**.

## 6. Repository Standards
- Multi-stage Docker configurations are mandatory.
- Never hardcode environmental secrets inside images or Dockerfiles.

## 7. Examples

### Multi-Stage Production Dockerfile for python/Node service
```dockerfile
# Stage 1: Compile dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends     build-essential     && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final minimal execution container
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PATH=/home/appuser/.local/bin:$PATH

RUN groupadd -g 10001 appuser &&     useradd -u 10001 -g appuser -m -s /sbin/nologin appuser

COPY --from=builder /root/.local /home/appuser/.local
COPY . .

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
```

## 8. Best Practices
- Keep image sizes compact by excluding build tools and using `.dockerignore`.
- Pin all packages and parent image hashes strictly in configurations.

## 9. Anti-patterns
- **Root Running**: Running application containers directly as `root`, opening security threat vectors.

## 10. Security Considerations
- Never copy private SSH keys or credentials into intermediate or final build layers.

## 11. Performance Considerations
- Order commands by volatility to maximize layer cache hit rates (e.g. copy dependency lists before code).

## 12. Testing Strategy
- Verify image status and configurations in local docker-compose environments.

## 13. Review Checklist
- [ ] Is the final execution user configured as a non-privileged user?
- [ ] Are all unnecessary development packages excluded from the production image?

## 14. Common Mistakes
- Leaving cached installation files inside intermediate layers.

## 15. Future Improvements
- Switch to distroless container bases for extremely hardened and small production packages.

## 16. Revision History
- **v1.0.0**: Standardized secure multi-stage Docker profiles.

## 17. Related References
- Skills: [DevOps](devops.md), [Backend](backend.md)
- Rules: [Deployment Rules](../rules/deployment-rules.md)
