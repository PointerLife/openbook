# Productivity Section Refactor Prompt

## Objective
Refactor `components/landing/productivity-section.tsx` to use a modern, animated **Bento Grid layout** for features, with the **Chat Input** positioned as a standalone interactive element below the grid.

## Context
- **Ref Idea**: "Learn smarter, not harder."
- **Visual Style**: Clean, modern, using the existing "Bento" aesthetic found in `features-section.tsx`.
- **Animations**: Uses Lottie animations for feature visualization using the existing `@/components/ui/lottie-animation` component.

## Detailed Requirements

### 1. Layout Structure
The section should be divided into two main parts:
1.  **The Bento Grid** (Features)
2.  **The Interactive Area** (Chat Input)

#### Part A: Bento Grid
-   **Grid System**: CSS Grid with 3 columns on desktop (`md:grid-cols-3`).
-   **Items**: 4 Feature Cards.
-   **Arrangement**:
    -   **Row 1**:
        -   **Card 1 (Spaced Repetition)**: Large (Spans 2 columns).
        -   **Card 2 (Active Recall)**: Standard (Spans 1 column).
    -   **Row 2**:
        -   **Card 3 (Concept Mapping)**: Standard (Spans 1 column).
        -   **Card 4 (Knowledge Synthesis)**: Large (Spans 2 columns).
-   **Responsiveness**: Stack vertically (1 column) on mobile.

#### Part B: Chat Input
-   **Position**: Strictly **below** the Bento Grid.
-   **Styling**: Full-width or contained central block, maintaining its current interactive functionality.
-   **Spacing**: Ensure distinct separation (`mt-12` or similar) from the grid.

### 2. Component Architecture
Reuse or adapt patterns from `components/landing/features-section.tsx`:

#### `BentoCard` Component
-   **Props**: `title`, `description`, `className`, `children` (visual), `delay`.
-   **Styling**:
    -   `rounded-3xl`.
    -   `bg-card/50` with `backdrop-blur`.
    -   Border: `border-border/40`.
    -   Hover effect: `hover:bg-card/80` and subtle scale or border highlight.
-   **Animation**: `framer-motion` entry animation (fade up).

#### Feature Visuals (New Components)
Create a dedicated "Visual" component for each feature to encapsulate the Lottie animation and decorative elements. Use `LottieAnimation` with placeholders.

1.  **`SpacedRepetitionVisual`**
    -   **Concept**: Cycles/Repeat logic.
    -   **Lottie Placeholder**: "Repetition" or "Clock".
2.  **`ActiveRecallVisual`**
    -   **Concept**: Lightning/Memory spark.
    -   **Lottie Placeholder**: "Spark" or "Brain".
3.  **`ConceptMappingVisual`**
    -   **Concept**: Nodes connecting.
    -   **Lottie Placeholder**: "Network" or "Graph".
4.  **`KnowledgeSynthesisVisual`**
    -   **Concept**: Bringing ideas together.
    -   **Lottie Placeholder**: "Magic" or "Alchemy".

### 3. Implementation Steps
1.  **Import Dependencies**:
    -   `motion` from `framer-motion`.
    -   `LottieAnimation` from `@/components/ui/lottie-animation`.
    -   `cn` from `@/lib/utils`.
2.  **Define `BentoCard`**: Copy or import the definition from `features-section.tsx` (ensure it's locally defined if not exported, or refactor to a shared UI component if preferred, but local definition is fine for now to keep it self-contained).
3.  **Construct Grid**:
    ```tsx
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BentoCard className="md:col-span-2">...</BentoCard>
      <BentoCard className="md:col-span-1">...</BentoCard>
      <BentoCard className="md:col-span-1">...</BentoCard>
      <BentoCard className="md:col-span-2">...</BentoCard>
    </div>
    ```
4.  **Add Chat Input**: Place the existing `<ChatInput />` logic in a wrapper div below the grid.

## Content Map

| Feature | Title | Description | Size |
| :--- | :--- | :--- | :--- |
| **Spaced Repetition** | Spaced Repetition | "Optimize review times to maximize retention with smart scheduling." | 2x1 |
| **Active Recall** | Active Recall | "Test yourself actively to strengthen neural pathways." | 1x1 |
| **Concept Mapping** | Concept Mapping | "Visualize connections between complex ideas." | 1x1 |
| **Knowledge Synthesis** | Knowledge Synthesis | "Combine sources to create unique insights and summaries." | 2x1 |

## Animation Details
-   **Entry**: Staggered fade-in for cards (`delay={0.1}`, `delay={0.2}`, etc.).
-   **Lottie**: Use `<LottieAnimation placeholderText="..." />` inside the visual containers. match sizes to card styling (e.g., `w-32 h-32`).