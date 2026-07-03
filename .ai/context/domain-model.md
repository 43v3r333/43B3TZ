# 🧬 System Domain Models & Entities

This manual defines the structured data entities and relationship constraints within our sports analytics context.

---

## 🧬 Domain Entity Map

```mermaid
classDiagram
    class Tournament {
        int id
        string name
        string country
    }
    class Match {
        int id
        int tournament_id
        datetime match_time
        string home_team
        string away_team
        int home_goals
        int away_goals
        string status
    }
    class HistoricalOdd {
        int id
        int match_id
        string bookmaker
        float odds_home
        float odds_draw
        float odds_away
        datetime updated_at
    }
    class Prediction {
        int id
        int match_id
        float prob_home
        float prob_draw
        float prob_away
        datetime created_at
    }
    class PortfolioSlip {
        int id
        int match_id
        string selection
        float odds
        float stake_percentage
        float result_amount
        string status
        datetime created_at
    }

    Tournament "1" --> "0..*" Match : contains
    Match "1" --> "0..*" HistoricalOdd : records
    Match "1" --> "1" Prediction : evaluates
    Match "1" --> "0..*" PortfolioSlip : logs
```

---

## 📝 Entity Lifecycles & State Transitions

### 1. Match State Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Scheduled : Match added to calendar
    Scheduled --> Live : Match kickoffs
    Live --> Completed : Final whistle blown
    Live --> Postponed : Inclement weather
    Postponed --> Scheduled : Match rescheduled
    Completed --> [*] : Results settled
```

### 2. Portfolio Slip Settlement Flow
```mermaid
stateDiagram-v2
    [*] --> Pending : Kelly fraction calculated & slip logged
    Pending --> Won : Selection won
    Pending --> Lost : Selection lost
    Pending --> Voided : Match cancelled/postponed
    Won --> [*] : Capital credited
    Lost --> [*] : Capital debited
    Voided --> [*] : Capital returned
```

---

## 🧩 Key Model Attributes

* **Tournament**: Groups competitive leagues (e.g., Premier Soccer League (PSL), English Premier League (EPL)).
* **Match**: Individual sport event, capturing competing teams, scheduling, and results.
* **HistoricalOdd**: Records timeseries price fluctuations. Contains values for Home win, Draw, and Away win.
* **Prediction**: Houses the ML probability vector ($p_{\text{home}}$, $p_{\text{draw}}$, $p_{\text{away}}$).
* **PortfolioSlip**: Tracks user allocations, stake percentages, and returns.
