const API_URL = "http://localhost:3001/api";

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
