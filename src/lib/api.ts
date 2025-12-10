const API_URL = "http://localhost:3001/api";

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tier: string;
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

export async function createProject(title: string, userId: string): Promise<Project> {
  const res = await fetch(`${API_URL}/project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, userId }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create project");
  }
  
  return res.json();
}

export async function getProjects(userId?: string): Promise<Project[]> {
  const url = userId ? `${API_URL}/project?userId=${userId}` : `${API_URL}/project`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }
  
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_URL}/project/${id}`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch project");
  }
  
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/project/${id}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    throw new Error("Failed to delete project");
  }
}

export async function updateProject(id: string, title: string): Promise<Project> {
  const res = await fetch(`${API_URL}/project/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// Roadmap Functions
export async function generateRoadmap(prompt: string, projectId?: string): Promise<GeneratedRoadmap> {
  const res = await fetch(`${API_URL}/roadmap/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, projectId }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate roadmap");
  }

  return data;
}

export async function updateRoadmap(
  id: string, 
  data: { nodes?: unknown; edges?: unknown; title?: string }
): Promise<GeneratedRoadmap> {
  const res = await fetch(`${API_URL}/roadmap/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();
  
  if (!res.ok) {
    throw new Error(responseData.error || "Failed to update roadmap");
  }

  return responseData;
}

export async function getRoadmap(id: string): Promise<GeneratedRoadmap> {
  const res = await fetch(`${API_URL}/roadmap/${id}`);

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
  await fetch(`${API_URL}/chat/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
export async function generateQuiz(topic: string, description?: string): Promise<QuizResponse> {
  const res = await fetch(`${API_URL}/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, description }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate quiz");
  }

  return data;
}

export interface SubmitQuizParams {
  roadmapId: string;
  nodeId: string;
  userId: string;
  answers: number[];
  questions: QuizQuestion[];
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
  const res = await fetch(`${API_URL}/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
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
  userId: string
): Promise<QuizResultData | null> {
  const res = await fetch(`${API_URL}/quiz/result/${roadmapId}/${nodeId}/${userId}`);

  if (res.status === 404) {
    return null;
  }

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || "Failed to get quiz result");
  }

  return data;
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
}

export interface ProfileResponse {
  user: UserProfile;
  projects: ProjectWithStats[];
  stats: ProfileStats;
}

// Profile Functions
export async function getProfile(userId: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_URL}/profile/${userId}`);

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

export async function updateProfile(userId: string, params: UpdateProfileParams): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/profile/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || "Failed to update profile");
  }

  return data;
}
