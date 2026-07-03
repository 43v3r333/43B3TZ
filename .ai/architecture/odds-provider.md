# 🦾 Enterprise Architecture: Odds Provider Abstraction & Adapter Layer

## 📋 Governance & Control Metadata
- **Status**: APPROVED (Enterprise Standard)
- **Review Frequency**: Bi-annual
- **Owner**: Principal Software Architect
- **Cross References**: system-overview, data-ingestion, value-betting-engine
- **Revision History**:
- `v1.0.0` (2026-06-29): Initial baseline Odds Provider spec.

---

## 🎯 1. Purpose & Objectives
Exposes how the platform decouples business logic from individual bookmaker APIs through strict adapter layers.

---

## 🔍 2. Scope & Applicability
Universal standard for integrating new regional bookmakers.

---

## 🏢 3. Structural Responsibilities
- **Responsibility**: Define unified interfaces for accessing, normalizing, and comparing betting odds.
- **Responsibility**: Map bookmaker-specific market types to standardized platform enumeration formats.
- **Responsibility**: Handle provider-specific exceptions, rate limits, and network connection resets.

---

## 🎨 4. Core Design Principles
- **Design Principle**: Loose Coupling: The platform must not have direct knowledge of individual bookmakers (e.g., Betway).
- **Design Principle**: Unified Currency & Decimals: Normalise decimal formats, and enforce standardized South African Rand (ZAR) structures.

---

## 🛠️ 5. Architectural Decisions (ADR Alignment)
- **Architectural Decision**: Implement an `IOddsProvider` abstract base class defining the standard interface requirements.
- **Architectural Decision**: Implement isolated bookmaker adapters (e.g., `BetwayProviderAdapter`, `HollywoodbetsProviderAdapter`) inheriting from the base class.

---



## ⚙️ 7. Core Technical Deep Dive

### 🛠️ IOddsProvider Abstract Definition
```python
from abc import ABC, abstractmethod
from typing import List, Dict
from models import NormalizedOdds

class IOddsProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def fetch_live_odds(self, fixture_id: str) -> NormalizedOdds:
        """Fetch, sanitize, and return normalized decimal odds."""
        pass

    @abstractmethod
    def normalise_teams(self, raw_home: str, raw_away: str) -> Dict[str, str]:
        """Standardize raw team strings into system identifiers."""
        pass
```


---


## 💡 8. Implementation Best Practices
- **Best Practice**: Use a factory pattern (`OddsProviderFactory`) to dynamically load active bookmaker providers.
- **Best Practice**: Regularly run provider health checks, raising flags if a provider returns stale odds.

---

## ❌ 9. Architectural Anti-patterns
- **Anti-Pattern**: Adding bookmaker-specific conditional code inside core value-bet prediction routines.
- **Anti-Pattern**: Failing to isolate provider-specific API changes, causing platform-wide compilation breaks.

---

## 🔒 10. Security & Threat Considerations
- **Boundary Controls**: Strict ingress-egress filtering and validation on all interaction pathways.
- **Identity & Access**: Zero-trust approach to internal calls and API authentication.
- **Security Posture**: API authentication tokens and keys for external providers are rotated automatically every 30 days.

---

## ⚡ 11. Performance Considerations
- **Execution Budget**: Low-latency benchmarks targeting p95 boundaries.
- **Caching & Caching Strategy**: Read-aside cache patterns combined with transactional isolation.
- **Performance Details**: Adapters cache normalized odds inside Redis to prevent repetitive high-overhead database queries.

---

## 📈 12. Scalability Considerations
- **Horizontal Scaling**: Stateless execution nodes capable of elastic growth.
- **Data Scaling**: TimescaleDB partitioning and query-read-replica isolation.
- **Scalability Details**: Easily add new bookmaker adapters without modifying downstream scoring, prediction, or sizing services.

---

## 🧪 13. Comprehensive Testing Strategy
- **Unit Boundary Verification**: 100% logic coverage of calculations and data formats.
- **Integration & Validation Paths**: End-to-end sandbox simulations validating pipeline integrity.
- **Testing Approach**: Provides clear abstract mock classes to test value calculations with deterministic odds arrays.

---

## 🔧 14. Operational Considerations
- **Logging & Visibility**: Structured JSON logs emitted directly to log aggregation collectors.
- **Alerting thresholds**: SRE metrics integrated with Slack/Telegram escalation schedules.
- **Operational Details**: Generates operational metrics detailing provider API response latency, connection drops, and drift rates.

---

## ⚠️ 15. Common Architectural Mistakes
- **Execution Mistake**: Confusing home/away team mappings due to inconsistent provider text formats.
- **Execution Mistake**: Failing to normalize odds decimal points, leading to catastrophic staking calculation errors.

---

## 🚀 16. Continuous Future Improvements
- **Future Improvement**: Implement real-time odds comparison tables to identify inter-provider arbitrage opportunities.
- **Future Improvement**: Support automated scraper failover paths to fallback mirror sites.

---

## 🕵️ 17. Architecture Review Checklist
- [ ] **Verify**: Confirm the new provider adapter inherits cleanly from the IOddsProvider interface.
- [ ] **Verify**: Verify that team mappings are successfully resolved against the standardized database roster.

---

## 🔗 18. References & Linked Resources
- [system-overview](system-overview.md)
- [data-ingestion](data-ingestion.md)
- [value-betting-engine](value-betting-engine.md)
