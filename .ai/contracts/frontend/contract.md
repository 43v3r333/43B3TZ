# Frontend Subsystem Contract

## 1. Metadata
* **Purpose**: Regulates UI structure, component prop boundaries, state management systems, and style regulations across client dashboards.
* **Version**: `v1.0.0`
* **Owner**: `Frontend Architect` & `React Engineer`
* **Compatibility Policy**: Component props should utilize optional attributes to support forward compatibility. Component signatures cannot be modified without major version increments.
* **Breaking-Change Policy**: Layout structure re-organizations must run under feature flags inside development environments before final branch mergers.
* **Migration Strategy**: Staged feature-flagged visual rollouts alongside comprehensive client-side unit/E2E test suites.

---

## 2. Component Prop Schemas & Visual Standards

### 2.1 Interface: Value Bet Card Component (`ValueBetCardProps`)
Specifies the exact inputs required to render a value bet visual item.

```typescript
export interface ValueBetCardProps {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  odds: number;
  impliedProbability: number;
  kellyPercentage: number;
  bookmaker: string;
  onPlaceSlip: (id: string, stake: number) => Promise<void>;
}
```

### 2.2 Client State Architecture Rules
```typescript
export interface ClientAppState {
  activeView: "overview" | "explorer" | "architecture" | "sandbox" | "agents";
  selectedCategoryId: string;
  selectedFileId: string | null;
  searchQuery: string;
  isSyncing: boolean;
}
```

---

## 3. Validation Rules
1. **Interactive Element Sizing**: All interactive touch points (buttons, select dropdowns) must declare a minimum dimension of `44px` on mobile-prefixes.
2. **State Updates**: React components are strictly forbidden from directly updating state inside component rendering loops, avoiding infinite cycles.
3. **Typography Standard**: Display text must leverage Inter with precise font weights (e.g. `font-sans font-medium tracking-tight`).

---

## 4. Examples

### React Component Specification Example
```tsx
import { useState } from "react";
import { ValueBetCardProps } from "./types";

export function ValueBetCard({
  id,
  league,
  homeTeam,
  awayTeam,
  odds,
  impliedProbability,
  kellyPercentage,
  bookmaker,
  onPlaceSlip
}: ValueBetCardProps) {
  const [stake, setStake] = useState<number>(100);

  return (
    <div id={`card-${id}`} className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
      <span className="font-mono text-xs text-gray-500">{league}</span>
      <h3 className="font-sans font-medium text-gray-900 mt-1">{homeTeam} vs {awayTeam}</h3>
      <div className="flex gap-4 mt-3">
        <div>
          <span className="text-xs text-gray-500 block">Odds</span>
          <span className="font-mono text-sm font-semibold">{odds.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Kelly Stake</span>
          <span className="font-mono text-sm font-semibold text-green-600">{(kellyPercentage * 100).toFixed(1)}%</span>
        </div>
      </div>
      <button 
        id={`btn-place-${id}`}
        onClick={() => onPlaceSlip(id, stake)} 
        className="w-full mt-4 bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Place Bet via {bookmaker}
      </button>
    </div>
  );
}
```
