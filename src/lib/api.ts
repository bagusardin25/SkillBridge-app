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

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
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
