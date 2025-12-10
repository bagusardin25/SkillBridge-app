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

// Helper to extract topic from prompt for project naming
export function extractTopicFromPrompt(prompt: string): string {
  // Remove common phrases to get the topic
  const cleaned = prompt
    .toLowerCase()
    .replace(/create|make|generate|build|buat|bikin/gi, "")
    .replace(/roadmap|path|jalur/gi, "")
    .replace(/for|to|learn|learning|belajar|untuk/gi, "")
    .replace(/from scratch|dari awal|dasar/gi, "")
    .replace(/how to|cara/gi, "")
    .replace(/i want to|saya ingin|saya mau/gi, "")
    .trim();
  
  // Capitalize first letter of each word
  const topic = cleaned
    .split(" ")
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  return topic || "New Project";
}
