# PROJECT: SkillBridge (SaaS AI Learning Flowchart)

## 1. Project Philosophy & Goal
We are building a SaaS application similar to a simplified, AI-powered "roadmap.sh".
- **Goal:** Help users learn complex concepts (e.g., "Learn Go", "System Design") by generating interactive flowcharts via AI.
- **Core Experience:** Users type a prompt -> AI generates a visual node-based roadmap -> User can edit/drag nodes & chat with AI to expand details.
- **Development Strategy:** Frontend First. We will build a fully functional UI using Local Storage for data persistence (MVP), then integrate a real Backend (Express/Postgres) later.

## 2. Tech Stack (Strict Constraints)
### Frontend (The Priority)
- **Framework:** React (Vite) - *Do not use Next.js for this iteration.*
- **Language:** TypeScript.
- **Visual Engine:** React Flow (XYFlow) - *Critical for the diagram editor.*
- **Styling:** Tailwind CSS + Shadcn/UI.
- **Icons:** Lucide React.
- **State/Storage:** Zustand (State Management) + LocalStorage (Persistence for MVP).

### Backend (Future Phase - For Context Only)
- **Server:** Node.js + Express.js.
- **Database:** PostgreSQL + Prisma ORM.

### AI Integration
- **LLM:** OpenAI API (GPT-4o or GPT-4o-mini) or Gemini API.
- **Role:** The AI acts as a "Curriculum Architect" generating JSON data for the flowcharts.

## 3. Core Features (MVP Scope)
1.  **Project Management (Sidebar):**
    - Create/Delete Projects (saved in LocalStorage).
    - Sidebar navigation to switch between roadmaps.
2.  **The Canvas (Diagram Editor):**
    - Drag-and-drop nodes.
    - Connect nodes with edges.
    - Auto-layout support (using `dagre` or `elkjs` to organize AI output).
3.  **AI Command Center:**
    - A Chat Panel/Input area where users type: "Create a roadmap for Backend Developer".
    - The system converts this text into React Flow nodes/edges.
4.  **Interactive Learning:**
    - Click a node to open a "Detail Panel".
    - Chat with AI specifically about that node's topic.

## 4. Data Structure (The Protocol)
The AI must generate JSON strictly following this schema to work with React Flow:

```typescript
// Prompt to LLM should request this structure:
interface RoadmapResponse {
  title: string;
  nodes: {
    id: string;
    label: string; // The topic title
    type: "default" | "input" | "output";
    data: { 
       description: string; 
       resources: string[] 
    }
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
}

Note: The frontend must calculate position: {x, y} using a layout library (dagre) after receiving this JSON.

5. Development Phases (Step-by-Step Instructions for AI Coder)
PHASE 1: Setup & UI Skeleton (No AI yet)

Initialize Vite + React + TypeScript + Tailwind.

Install Shadcn/UI components (Button, Sidebar, Sheet, Input).

Create a Layout: Left Sidebar (Projects), Main Area (Canvas), Right Panel (Chat/Details).

PHASE 2: The Flowchart Engine

Implement React Flow in the Main Area.

Create a custom hook useRoadmapStore with Zustand that saves/loads from localStorage.

Add functionality to manually add nodes and connect edges (Drag & Drop).

PHASE 3: AI Logic Integration

Create a service function that mocks an AI response (returns static JSON first).

Implement the "Auto Layout" function (using dagre) to arrange the nodes automatically.

Connect the Chat Input to trigger the mock generation -> render nodes on canvas.

PHASE 4: Real AI Connection

Replace mock data with real fetch calls to OpenAI/Gemini API.

Implement the "Chat with Node" feature in the Right Panel.