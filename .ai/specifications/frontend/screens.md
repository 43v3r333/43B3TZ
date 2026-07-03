# Frontend Interface Screen Specifications

## 1. Dashboard UI Screen
A highly polished, dark-themed bento terminal optimized for desktop viewing.

### Wireframe Layout
\`\`\`
+-------------------------------------------------------------+
| [Header] Logo | Time UTC | Sync Indicator | [User settings] |
+-------------------------------------------------------------+
| [Bento Widget 1]          | [Bento Widget 2]                |
| Active Bankroll & ROI     | Dynamic Yield Charts            |
+---------------------------+---------------------------------+
| [Active Alerts Panel]                                       |
| Match Edge | Bookmaker Odds | Rec. Stake % | Action Button  |
+-------------------------------------------------------------+
\`\`\`

### Dynamic State States
- **Syncing State**: Soft pulsing indicator showing live WebSocket active connection is receiving bookmaker updates.
- **Error Boundary**: If WebSocket drops, soft fallback banner displays reconnecting timers without disrupting table renders.

## 2. Sandbox Sandbox Screen
Provides an interactive space where traders can adjust form feature weights, Kelly multipliers, and run Monte Carlo simulations.
