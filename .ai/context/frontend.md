# ⚛️ Frontend UI Architecture & State Patterns

This manual outlines the React 19 visual systems, responsive designs, and interactive chart visualizations.

---

## ⚛️ React 19 / TypeScript Stack

- **Vite & TypeScript**: Standard Vite development pipeline and strict TypeScript type structures. No wildcard typings are permitted.
- **Tailwind CSS v4**: Utility-first styling with custom dark theme variables defined under `/src/index.css`.
- **Lucide Icons**: All application icon resources must be imported from the `lucide-react` package.

---

## 📂 UI Folder Structure

```
├── src/
│   ├── components/            # Extracted visual tables, cards, and modal components
│   ├── data/                  # Static structures and workspace lists
│   ├── index.css              # Global styles, Tailwind variables, and fonts
│   ├── main.tsx               # Main DOM renderer entry point
│   └── App.tsx                # Main interactive dashboard container
```

---

## 📊 Chart Visualizations

We use **Recharts** for data visualization, providing responsive design containers that resize fluidly across viewports.
