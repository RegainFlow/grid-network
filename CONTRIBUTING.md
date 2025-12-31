# Contributing to Grid Infrastructure Analytics Platform

Welcome to the **Grid Infrastructure Analytics Platform** project! This guide will help you understand the project structure, architecture, and how to contribute effectively to our mission of securing and optimizing critical utility infrastructure.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Design System](#design-system)
5. [Development Workflow](#development-workflow)
6. [Code Standards](#code-standards)
7. [Testing](#testing)
8. [Submitting Changes](#submitting-changes)

---

## Project Overview

**Grid Infrastructure Analytics Platform** is an automated system designed to detect anomalies in utility and industrial grid infrastructure. It monitors thousands of sensor nodes to identify irregularities, predict failures, and optimize maintenance schedules.

The platform integrates:

-   **Real-Time Telemetry:** Ingestion of high-frequency sensor data (voltage, temperature, pressure).
-   **Anomaly Detection:** Statistical and ML-based analysis to flag outliers.
-   **Interactive Visualization:** Real-time dashboards using Recharts for visual inspection.
-   **AI-Powered Analysis:** **Gemini AI** for explaining anomalies and suggesting remediation steps.

## Deployment Architecture

1.  **Ingestion Layer:** Aggregates streams from field sensors (Grid Nodes).
2.  **Analytics Engine:** Processes streams for real-time anomaly detection.
3.  **Visualization Layer:** React-based dashboard for operators (the current repository).

## Key Principles

-   🛡️ **Reliability First:** Code must be robust; false negatives in critical infrastructure are not acceptable.
-   📊 **Real-Time Visibility:** Latency matters. Dashboards must reflect live conditions instantly.
-   🤖 **AI-Assisted Diagnostics:** Use Gemini to augment operator decision-making, not replace it.

---

## Tech Stack

-   **Frontend:** React 19 + TypeScript + Vite
-   **Visualization:** Recharts (for telemetry graphs)
-   **Styling:** Vanilla CSS with Glass Morphism design system
-   **Icons:** Lucide React
-   **AI Integration:** Google Gemini AI (via Google GenAI SDK)
-   **Build Tool:** Vite

---

## Getting Started

### Prerequisites

-   **Node.js** (v18 or higher)
-   npm or yarn
-   Git
-   **Gemini API Key** (for AI analysis features)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-org/grid-infrastructure-analytics.git
    cd grid-infrastructure-analytics
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory:

    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open your browser:** Navigate to `http://localhost:5173`

---

## Architecture

We follow a modular, feature-based architecture to ensure scalability as we add more sensor types and analytics features.

### Current Structure

```
grid-network/
├── components/          # Shared Reach components (Charts, Cards)
│   └── Dashboard.tsx
├── services/            # API and AI integrations
│   └── geminiService.ts
├── types.ts             # TypeScript domain models (Sensor, Anomaly)
├── App.tsx              # Main application layout
├── STYLES.md            # Design system documentation
└── package.json
```

### Target Structure (Scaled)

As we scale, we will adopt a feature-based structure:

```
src/
├── app/                 # Application entry
│   ├── App.tsx
│   └── provider.tsx
│
├── components/          # Shared UI components
│   ├── ui/              # Buttons, Cards, Inputs
│   └── charts/          # Reusable Recharts wrappers
│
├── features/            # Feature-based modules
│   ├── dashboard/       # Main Operational View
│   │   ├── components/  # Dashboard-specific widgets
│   │   └── hooks/       # Data fetching logic
│   │
│   ├── drivers/         # Sensor Drivers & Adapters
│   │   └── api/         # Ingestion simulation
│   │
│   └── analytics/       # Analysis Reporting
│       ├── api/         # Gemini Service integration
│       └── components/  # Anomaly Report cards
│
├── lib/                 # Core libraries
│   └── gemini.ts        # AI Client setup
│
├── styles/              # Global styles
│   ├── variables.css    # Design tokens (Neon/Glass)
│   └── utilities.css    # Layout helpers
```

---

## Design System

All UI/UX work **MUST** follow the `STYLES.md` design guide.

### Key Design Principles

**Glass Morphism + Neon Aesthetic**

-   **Backgrounds:** Dark, rich colors with frosted glass overlays.
-   **Accents:** Subtle cyan/neon colors (`--color-primary`) to denote active power/data flow.
-   **Data Density:** High density is allowed but must remain readable.

### Utility Classes

Use pre-defined utility classes from `STYLES.md`:

```tsx
// Glass container for sensor data
<div className="glass-card">
  <SensorGraph data={telemetry} />
</div>

// Neon status indicator
<span className="text-highlight">CRITICAL</span>
```

---

## Development Workflow

1.  **Create a Feature Branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

    **Naming Conventions:**
    -   `feature/` - New visualizations or sensor integrations
    -   `fix/` - Bug fixes (e.g., calculation errors, rendering glitches)
    -   `refactor/` - Code structure improvements
    -   `docs/` - Documentation updates

2.  **Follow the Architecture**
    -   **Types First:** Define your `SensorData` or `AnomalyReport` interfaces in `types.ts` (or feature folder).
    -   **Mock Data:** Since real hardware isn't always available, create realistic mock data generators for development.

3.  **Visual Testing**
    -   Ensure charts render correctly with sparse and dense datasets.
    -   Verify the specific "Glass Morphism" look is maintained on all new components.

---

## Code Standards

### TypeScript

```typescript
// ✅ GOOD: Explicit interfaces for Sensor Data
interface SensorTelemetry {
  nodeId: string;
  timestamp: number;
  voltage: number;
  temperature: number;
}

// ❌ BAD: Using 'any' for data streams
const processData = (stream: any) => { ... }
```

### React Components

```tsx
// ✅ GOOD: Typed Props
interface SensorCardProps {
  node: SensorNode;
  isActive: boolean;
}

export const SensorCard = ({ node, isActive }: SensorCardProps) => {
  return (
    <div className={`glass-card ${isActive ? 'active-glow' : ''}`}>
      <h3>{node.name}</h3>
    </div>
  );
};
```

---

## Testing

### Manual Testing Checklist

Before submitting a PR, verify:

-   [ ] **Dashboard Loads:** No white screen of death on startup.
-   [ ] **Data Visualization:** Charts render and update with mock data.
-   [ ] **AI Integration:** Gemini Analysis triggers correctly (if providing an API key).
-   [ ] **Responsive Design:** Dashboard is usable on tablet/desktop sizes.
-   [ ] **Styling:** Adheres to the Neon/Glass aesthetic in `STYLES.md`.

---

## Submitting Changes

1.  **Commit with Conventional Commits**

    ```bash
    git commit -m "feat(dashboard): add temperature heatmap"
    git commit -m "fix(ingestion): resolve timestamp parsing error"
    ```

2.  **Push and PR**
    Push to your branch and open a Pull Request.

    **PR Checklist:**
    -   [ ] Screenshots of UI changes (critical for this visual-heavy project).
    -   [ ] Confirmation that no existing charts are broken.

---

## Project Roadmap

-   **Phase 1: Foundation (Current)** - Core dashboard, mock telemetry, basic Gemini integration.
-   **Phase 2: Sensor Expansion** - Support for vibration and acoustic sensors.
-   **Phase 3: Predictive Maintenance** - Long-term trend analysis and failure forecasting.

---

**Thank you for contributing to the Grid Infrastructure Analytics Platform!** 🌍⚡
