# SkillBridge Backend + AI Implementation Spec

## Overview
Implementasi backend dan integrasi AI untuk mengubah mock data menjadi sistem yang fully functional.

---

## 1. Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| AI Provider | OpenAI GPT-4 / Google Gemini |
| Auth (Optional) | JWT / Clerk |

---

## 2. Project Structure

```
skillbridge/
├── src/                    # Frontend (existing)
├── server/                 # NEW: Backend
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── routes/
│   │   │   ├── roadmap.ts # CRUD + AI generation
│   │   │   └── chat.ts    # AI chat endpoint
│   │   ├── services/
│   │   │   └── ai.ts      # OpenAI/Gemini integration
│   │   └── lib/
│   │       └── prisma.ts  # Prisma client
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── package.json
│   └── tsconfig.json
```

---

## 3. Database Schema (Prisma)

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  projects  Project[]
  createdAt DateTime  @default(now())
}

model Project {
  id        String   @id @default(cuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  roadmaps  Roadmap[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Roadmap {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  nodes     Json     // Store as JSON array
  edges     Json     // Store as JSON array
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 4. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roadmap/generate` | Generate roadmap from prompt |
| GET | `/api/roadmap/:id` | Get roadmap by ID |
| PUT | `/api/roadmap/:id` | Update roadmap (nodes/edges) |
| DELETE | `/api/roadmap/:id` | Delete roadmap |
| POST | `/api/chat` | Chat with AI (follow-up questions) |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create new project |

---

## 5. AI Prompt Engineering

### Roadmap Generation Prompt

```typescript
const SYSTEM_PROMPT = `You are SkillBridge, an AI that creates structured learning roadmaps.

When given a learning goal, generate a roadmap in this EXACT JSON format:
{
  "title": "Roadmap Title",
  "nodes": [
    {
      "id": "1",
      "label": "Step Name",
      "type": "input|default|output",
      "data": {
        "description": "What to learn and why",
        "resources": ["https://resource1.com", "https://resource2.com"]
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

Rules:
- First node should be type "input" (starting point)
- Last node(s) should be type "output" (goal achieved)
- Middle nodes are type "default"
- Maximum 10-15 nodes for clarity
- Include real, verified learning resources
- Order nodes from beginner to advanced`;
```

### Response Parsing

```typescript
async function generateRoadmap(prompt: string): Promise<RoadmapResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }, // Force JSON output
    temperature: 0.7,
  });
  
  return JSON.parse(completion.choices[0].message.content);
}
```

---

## 6. Frontend Integration

### ChatPanel Update

```typescript
// Replace mock setTimeout with real API call
const handleSendMessage = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!inputValue.trim()) return;

  setMessages(prev => [...prev, userMessage]);
  setIsLoading(true);

  try {
    // Check if it's a roadmap generation request
    if (inputValue.toLowerCase().includes("roadmap") || 
        inputValue.toLowerCase().includes("belajar")) {
      
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue })
      });
      
      const roadmap = await response.json();
      
      // Update canvas with generated roadmap
      setNodes(transformToReactFlowNodes(roadmap.nodes));
      setEdges(roadmap.edges);
      
      // Show success message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Roadmap "${roadmap.title}" berhasil dibuat! 🎉`
      }]);
    } else {
      // Regular chat (follow-up questions)
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: inputValue, context: messages })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    }
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

---

## 7. Implementation Phases

### Phase 1: Backend Setup (1-2 jam)
- [ ] Initialize Express + TypeScript project in `/server`
- [ ] Setup Prisma + PostgreSQL connection
- [ ] Create database schema and migrate

### Phase 2: AI Integration (2-3 jam)
- [ ] Setup OpenAI/Gemini SDK
- [ ] Create `ai.ts` service with prompt engineering
- [ ] Implement `/api/roadmap/generate` endpoint
- [ ] Test with sample prompts

### Phase 3: Frontend Connection (1-2 jam)
- [ ] Update ChatPanel to call real API
- [ ] Add error handling and loading states
- [ ] Connect roadmap generation to canvas update
- [ ] Setup Vite proxy for development

### Phase 4: Persistence (1-2 jam)
- [ ] Implement CRUD endpoints for projects/roadmaps
- [ ] Replace localStorage with database operations
- [ ] Add auto-save functionality

---

## 8. Environment Variables

```env
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge"
OPENAI_API_KEY="sk-..."
# OR
GEMINI_API_KEY="..."
```

---

## 9. Pertanyaan Sebelum Implementasi

1. **AI Provider**: Prefer OpenAI GPT-4 atau Google Gemini? (Gemini lebih murah, GPT-4 lebih konsisten)
2. **Database**: Sudah punya PostgreSQL local atau mau pakai cloud (Supabase/Neon)?
3. **Auth**: Perlu user authentication sekarang atau nanti?
4. **Monorepo vs Separate**: Backend di folder `/server` (monorepo) atau repo terpisah?

---

## 10. Catatan Tambahan

- Frontend sudah memiliki types `RoadmapResponse`, `RoadmapNode`, `RoadmapEdge` di `src/types/roadmap.ts`
- Dagre library sudah terinstall untuk auto-layout nodes
- Zustand store sudah siap menerima nodes/edges dari API
- ChatPanel sudah memiliki struktur UI yang siap diintegrasikan dengan real API
