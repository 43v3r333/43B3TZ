# 📔 Engineering Journal

## 📋 Governance & Control Metadata
- **Purpose**: Daily/weekly software engineering journals, brain-storming notes, and developer logs.
- **Update Policy**: Ongoing weekly entries. Maintain informal yet technical and informative styles.
- **Owner**: Development Team
- **Review Frequency**: Weekly
- **Cross References**: [Sprint Retrospectives](retrospectives.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Initial comprehensive journal baseline.

---

## 📝 Developer Entries

### Entry: 2026-06-22 — Solving the Platt Calibration Convergence Bug
- **Author**: @ml-ops
- **Topic**: Platt Scaling failing to converge on small leagues.
- **Notes**:
  - Platt scaling calibration via Logistic Regression threw a `ConvergenceWarning` on Romanian Liga I and South African PSL match tables.
  - *Investigation*: These leagues had extremely small match datasets in our timeseries DB (under 80 fixtures total). The L-BFGS solver could not optimize coefficients safely under standard parameters.
  - *Fix*: Created a fallback calibration mapper. For leagues with under 150 historic fixtures, the model uses global European league coefficients instead of isolated tournament coefficients. This solved convergence and lowered local calibration errors.

### Entry: 2026-06-26 — React 19 Layout Visual Tuning
- **Author**: @frontend-dev
- **Topic**: Redesigning the performance metrics cards for better visual weight and negative space.
- **Notes**:
  - Evaluated standard visual widgets. They looked a bit generic and crowded.
  - *Refactoring*: Cleaned up padding, introduced Space Grotesk for big stats metrics, and added custom Tailwind border-slate classes to achieve a polished, technical visual appearance.
  - Recharts component tooltips customized with clean, custom HTML structures.
