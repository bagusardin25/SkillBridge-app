const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Authenticated fetch helper — auto-attaches JWT Bearer token
function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...options, headers });
}

// Stream chat with AI via SSE — calls onChunk for each token as it arrives
export async function streamChat(
  params: {
    message: string;
    projectId: string | null;
    nodeId?: string;
    context?: { role: string; content: string }[];
    language?: string;
  },
  onChunk: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await authFetch(`${API_URL}/chat/stream`, {
    method: "POST",
    body: JSON.stringify(params),
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Failed to connect to streaming endpoint" }));
    throw new Error(data.error || "Failed to start streaming");
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const data = trimmed.slice(6); // Remove "data: " prefix

      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.content) {
          onChunk(parsed.content);
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue; // Skip malformed JSON
        throw e; // Re-throw actual errors
      }
    }
  }
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tier: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user?: AuthUser;
  token?: string;
}

export interface VerificationResponse {
  message: string;
}

export interface LoginErrorResponse {
  error: string;
  requiresVerification?: boolean;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// Auth Functions
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to login");
  }

  return data;
}

export async function registerUser(credentials: RegisterCredentials): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to register");
  }

  return data;
}

export async function verifyEmail(token: string): Promise<VerificationResponse> {
  const res = await fetch(`${API_URL}/auth/verify-email/${token}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to verify email");
  }

  return data;
}

export async function resendVerification(email: string): Promise<VerificationResponse> {
  const res = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to resend verification");
  }

  return data;
}

export async function forgotPassword(email: string): Promise<VerificationResponse> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to process request");
  }

  return data;
}

export async function resetPassword(token: string, password: string): Promise<VerificationResponse> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to reset password");
  }

  return data;
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to get user");
  }

  return data;
}

// Project Types
export interface Project {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  roadmaps: Roadmap[];
}

export interface Roadmap {
  id: string;
  title: string;
  projectId: string;
  nodes: unknown;
  edges: unknown;
  createdAt: string;
  updatedAt: string;
}

export async function createProject(title: string, _userId: string): Promise<Project> {
  const res = await authFetch(`${API_URL}/project`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create project");
  }

  return res.json();
}

export async function getProjects(_userId?: string): Promise<Project[]> {
  const res = await authFetch(`${API_URL}/project`);

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await authFetch(`${API_URL}/project/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch project");
  }

  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await authFetch(`${API_URL}/project/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete project");
  }
}

export async function updateProject(id: string, title: string): Promise<Project> {
  const res = await authFetch(`${API_URL}/project/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error("Failed to update project");
  }

  return res.json();
}

// Roadmap Types
export type NodeCategory = "core" | "optional" | "advanced" | "project";

export interface RoadmapNode {
  id: string;
  label: string;
  type: "input" | "default" | "output";
  category?: NodeCategory;
  data: {
    description: string;
    resources: string[];
    isCompleted?: boolean;
    videos?: (string | { url: string; title: string; thumbnail: string; channelTitle?: string })[];
    articles?: { url: string; title: string; source: string }[];
  };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  edgeType?: "main" | "branch";
}

export interface GeneratedRoadmap {
  id?: string;
  title: string;
  totalEstimatedTime?: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// User preferences for roadmap generation
export interface RoadmapPreferences {
  skillLevel: "beginner" | "intermediate" | "advanced";
  learningTime: "casual" | "moderate" | "intensive";
  learningStyle: "theory" | "practice" | "balanced";
  goal: "career" | "project" | "certification" | "hobby";
}

// Roadmap Functions
export async function generateRoadmap(
  prompt: string,
  projectId?: string,
  preferences?: RoadmapPreferences,
  language?: string
): Promise<GeneratedRoadmap> {
  const res = await authFetch(`${API_URL}/roadmap/generate`, {
    method: "POST",
    body: JSON.stringify({ prompt, projectId, preferences, language }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to generate roadmap");
  }

  return data;
}

export async function createRoadmap(
  projectId: string,
  data: { title?: string; nodes?: unknown; edges?: unknown }
): Promise<{ id: string; title: string; projectId: string; nodes: unknown; edges: unknown }> {
  const res = await authFetch(`${API_URL}/roadmap`, {
    method: "POST",
    body: JSON.stringify({ projectId, ...data }),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || "Failed to create roadmap");
  }

  return responseData;
}

export async function updateRoadmap(
  id: string,
  data: { nodes?: unknown; edges?: unknown; title?: string }
): Promise<GeneratedRoadmap> {
  const res = await authFetch(`${API_URL}/roadmap/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || "Failed to update roadmap");
  }

  return responseData;
}

export async function getRoadmap(id: string): Promise<GeneratedRoadmap> {
  const res = await authFetch(`${API_URL}/roadmap/${id}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to get roadmap");
  }

  return data;
}

// Save a single chat message to database
export async function saveChatMessage(
  projectId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  await authFetch(`${API_URL}/chat/save`, {
    method: "POST",
    body: JSON.stringify({ projectId, role, content }),
  });
}

// Helper to extract topic from prompt for project naming
export function extractTopicFromPrompt(prompt: string): string {
  // Clean up and extract meaningful words
  const cleaned = prompt
    .replace(/[?!.,]/g, "")
    .replace(/^(create|make|generate|build|buat|bikin|tolong|please|help|jelaskan|explain)\s+/gi, "")
    .replace(/\s+(roadmap|path|jalur|untuk|for|about|tentang|dari|from|cara|how)\s+/gi, " ")
    .replace(/\s+(saya|saya ingin|saya mau|i want|i need|gue|gw|aku)\s+/gi, " ")
    .trim();

  // Get important words, max 4
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  const title = words.slice(0, 4).map(w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(" ");

  return title || "New Chat";
}

// Quiz Types
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

// Quiz Functions
export async function generateQuiz(topic: string, description?: string, resources?: string[], language?: string): Promise<QuizResponse> {
  const res = await authFetch(`${API_URL}/quiz/generate`, {
    method: "POST",
    body: JSON.stringify({ topic, description, resources, language }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to generate quiz");
  }

  return data;
}

export async function getCachedQuiz(roadmapId: string, nodeId: string, _userId: string): Promise<QuizResponse | null> {
  try {
    const res = await authFetch(`${API_URL}/quiz/cached/${roadmapId}/${nodeId}`);
    const data = await res.json();

    if (data.cached && data.questions) {
      return { questions: data.questions as QuizQuestion[] };
    }
    return null;
  } catch {
    return null;
  }
}

export interface SubmitQuizParams {
  roadmapId: string;
  nodeId: string;
  userId: string;
  answers: number[];
  questions: QuizQuestion[];
  timeTaken?: number;
}

export interface QuizSubmitResult {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  message: string;
}

export async function submitQuiz(params: SubmitQuizParams): Promise<QuizSubmitResult> {
  const { userId, ...submitData } = params; // Strip userId — server gets it from JWT
  const res = await authFetch(`${API_URL}/quiz/submit`, {
    method: "POST",
    body: JSON.stringify(submitData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to submit quiz");
  }

  return data;
}

export interface QuizResultData {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: number[];
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export async function getQuizResult(
  roadmapId: string,
  nodeId: string,
  _userId: string
): Promise<QuizResultData | null> {
  const res = await authFetch(`${API_URL}/quiz/result/${roadmapId}/${nodeId}`);

  if (res.status === 404) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to get quiz result");
  }

  return data;
}

// ---------------------------------------------------------------------------
// Notes API
// ---------------------------------------------------------------------------

export interface NodeNoteData {
  note: string;
  updatedAt: string | null;
}

export async function getNodeNote(
  roadmapId: string,
  nodeId: string,
  _userId: string
): Promise<NodeNoteData> {
  const res = await authFetch(`${API_URL}/notes/${roadmapId}/${nodeId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch note");
  }

  return data;
}

export async function saveNodeNote(
  roadmapId: string,
  nodeId: string,
  _userId: string,
  content: string
): Promise<NodeNoteData> {
  const res = await authFetch(`${API_URL}/notes/${roadmapId}/${nodeId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to save note");
  }

  return data;
}

// Get all quiz results for a roadmap (for loading completion status)
export interface QuizResultSummary {
  nodeId: string;
  passed: boolean;
  score: number;
  totalQuestions: number;
}

export async function getQuizResultsForRoadmap(
  roadmapId: string,
  _userId: string
): Promise<QuizResultSummary[]> {
  const res = await authFetch(`${API_URL}/quiz/results/${roadmapId}`);

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.results || [];
}

// Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tier: string;
  bio: string | null;
  location: string | null;
  jobRole: string | null;
  xp: number;
  level: number;
  avatarUrl: string | null;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalLearningMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapStats {
  id: string;
  title: string;
  totalNodes: number;
  completedNodes: number;
  progress: number;
}

export interface ProjectWithStats {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  roadmaps: RoadmapStats[];
  totalNodes: number;
  completedNodes: number;
  overallProgress: number;
}

export interface ProfileStats {
  totalProjects: number;
  totalRoadmaps: number;
  totalQuizzesPassed: number;
  totalQuizzesTaken: number;
  totalCompletedTopics: number;
  totalCompletedRoadmaps: number;
}

export interface ProfileResponse {
  user: UserProfile;
  projects: ProjectWithStats[];
  stats: ProfileStats;
}

// Profile Functions
export async function getProfile(_userId: string): Promise<ProfileResponse> {
  const res = await authFetch(`${API_URL}/profile/me`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to get profile");
  }

  return data;
}

export interface UpdateProfileParams {
  name?: string;
  bio?: string;
  location?: string;
  jobRole?: string;
  avatarUrl?: string;
}

export async function updateProfile(_userId: string, params: UpdateProfileParams): Promise<UserProfile> {
  const res = await authFetch(`${API_URL}/profile/me`, {
    method: "PUT",
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update profile");
  }

  return data;
}

// Update user streak
export async function updateStreak(_userId: string): Promise<{ currentStreak: number; longestStreak: number; lastActiveDate: string }> {
  const res = await authFetch(`${API_URL}/profile/update-streak`, {
    method: "POST",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update streak");
  }

  return data;
}

// Add learning time
export async function addLearningTime(_userId: string, minutes: number): Promise<{ totalLearningMinutes: number }> {
  const res = await authFetch(`${API_URL}/profile/add-learning-time`, {
    method: "POST",
    body: JSON.stringify({ minutes }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to add learning time");
  }

  return data;
}

// Add XP to user
export async function addXp(_userId: string, amount: number): Promise<{ id: string; xp: number; level: number }> {
  const res = await authFetch(`${API_URL}/profile/add-xp`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to add XP");
  }

  return data;
}

// Share Roadmap Types
export interface PublicRoadmap {
  id: string;
  title: string;
  nodes: unknown;
  edges: unknown;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  project: {
    title: string;
    user: {
      name: string | null;
      avatarUrl: string | null;
    };
  };
}

// Toggle roadmap public status
export async function toggleRoadmapPublic(
  roadmapId: string,
  isPublic: boolean
): Promise<{ isPublic: boolean }> {
  const res = await authFetch(`${API_URL}/roadmap/${roadmapId}/public`, {
    method: "PATCH",
    body: JSON.stringify({ isPublic }),
  });

  if (!res.ok) {
    throw new Error("Failed to update sharing settings");
  }

  return res.json();
}

// Get public roadmap (no auth required)
export async function getPublicRoadmap(roadmapId: string): Promise<PublicRoadmap> {
  const res = await fetch(`${API_URL}/roadmap/public/${roadmapId}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to load roadmap");
  }

  return data;
}

// Node Chat Types
export interface ChatMessage {
  id: string;
  projectId: string;
  nodeId: string | null;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// Get chat history for a specific node
export async function getNodeChatHistory(
  projectId: string,
  nodeId: string
): Promise<{ messages: ChatMessage[] }> {
  const res = await authFetch(`${API_URL}/chat/${projectId}/node/${nodeId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch node chat history");
  }

  return res.json();
}

// Send chat message for a specific node
export async function sendNodeChatMessage(
  projectId: string,
  nodeId: string,
  message: string,
  context?: { role: string; content: string }[],
  language?: string
): Promise<{ reply: string }> {
  const res = await authFetch(`${API_URL}/chat`, {
    method: "POST",
    body: JSON.stringify({ message, projectId, nodeId, context, language }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
}

// Get general chat history for a project
export async function getChatHistory(
  projectId: string
): Promise<{ messages: ChatMessage[] }> {
  const res = await authFetch(`${API_URL}/chat/${projectId}`);

  if (!res.ok) {
    return { messages: [] };
  }

  return res.json();
}

// Send general chat message (without node context)
export async function sendGeneralChatMessage(
  message: string,
  projectId: string | null,
  context?: { role: string; content: string }[],
  language?: string
): Promise<{ reply: string }> {
  const res = await authFetch(`${API_URL}/chat`, {
    method: "POST",
    body: JSON.stringify({ message, projectId, context, language }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to send message");
  }

  return data;
}

// Clear chat history for a project
export async function clearChatHistory(projectId: string): Promise<void> {
  const res = await authFetch(`${API_URL}/chat/${projectId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to clear chat history");
  }
}

// Clear chat history for a specific node
export async function clearNodeChatHistory(projectId: string, nodeId: string): Promise<void> {
  const res = await authFetch(`${API_URL}/chat/${projectId}/node/${nodeId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to clear node chat history");
  }
}
