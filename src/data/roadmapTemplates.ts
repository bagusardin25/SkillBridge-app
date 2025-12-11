import type { RoadmapResponse } from "@/types/roadmap";

export interface RoadmapTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: string;
    roadmap: RoadmapResponse;
}

export const roadmapTemplates: RoadmapTemplate[] = [
    {
        id: "frontend-beginner",
        title: "Frontend Developer",
        description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript",
        category: "Web Development",
        icon: "🌐",
        difficulty: "beginner",
        estimatedTime: "3-4 months",
        roadmap: {
            title: "Frontend Developer Roadmap",
            nodes: [
                { id: "html", label: "HTML", type: "input", category: "core", data: { description: "Learn the structure of web pages", resources: ["https://developer.mozilla.org/en-US/docs/Learn/HTML", "https://www.w3schools.com/html/"] } },
                { id: "css", label: "CSS", type: "default", category: "core", data: { description: "Style your web pages", resources: ["https://developer.mozilla.org/en-US/docs/Learn/CSS", "https://css-tricks.com/"] } },
                { id: "js-basics", label: "JavaScript Basics", type: "default", category: "core", data: { description: "Add interactivity to websites", resources: ["https://javascript.info/", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript"] } },
                { id: "responsive", label: "Responsive Design", type: "default", category: "core", data: { description: "Make websites work on all devices", resources: ["https://web.dev/responsive-web-design-basics/"] } },
                { id: "git", label: "Git & GitHub", type: "default", category: "core", data: { description: "Version control for your code", resources: ["https://git-scm.com/book/en/v2", "https://docs.github.com/"] } },
                { id: "react", label: "React", type: "default", category: "advanced", data: { description: "Build modern user interfaces", resources: ["https://react.dev/", "https://beta.reactjs.org/"] } },
                { id: "tailwind", label: "Tailwind CSS", type: "default", category: "optional", data: { description: "Utility-first CSS framework", resources: ["https://tailwindcss.com/docs"] } },
                { id: "project", label: "Portfolio Project", type: "output", category: "project", data: { description: "Build a personal portfolio website", resources: [] } },
            ],
            edges: [
                { id: "e1", source: "html", target: "css" },
                { id: "e2", source: "css", target: "js-basics" },
                { id: "e3", source: "css", target: "responsive" },
                { id: "e4", source: "js-basics", target: "git" },
                { id: "e5", source: "js-basics", target: "react" },
                { id: "e6", source: "responsive", target: "tailwind", edgeType: "branch" },
                { id: "e7", source: "react", target: "project" },
                { id: "e8", source: "tailwind", target: "project", edgeType: "branch" },
            ],
        },
    },
    {
        id: "backend-beginner",
        title: "Backend Developer",
        description: "Master server-side development with Node.js and databases",
        category: "Web Development",
        icon: "⚙️",
        difficulty: "beginner",
        estimatedTime: "4-5 months",
        roadmap: {
            title: "Backend Developer Roadmap",
            nodes: [
                { id: "js-basics", label: "JavaScript Basics", type: "input", category: "core", data: { description: "Foundation for Node.js", resources: ["https://javascript.info/"] } },
                { id: "nodejs", label: "Node.js", type: "default", category: "core", data: { description: "JavaScript runtime for servers", resources: ["https://nodejs.org/en/docs/", "https://nodejs.dev/learn"] } },
                { id: "express", label: "Express.js", type: "default", category: "core", data: { description: "Web framework for Node.js", resources: ["https://expressjs.com/"] } },
                { id: "sql", label: "SQL & PostgreSQL", type: "default", category: "core", data: { description: "Relational databases", resources: ["https://www.postgresql.org/docs/", "https://sqlbolt.com/"] } },
                { id: "mongodb", label: "MongoDB", type: "default", category: "optional", data: { description: "NoSQL database", resources: ["https://docs.mongodb.com/"] } },
                { id: "auth", label: "Authentication", type: "default", category: "core", data: { description: "User auth with JWT", resources: ["https://jwt.io/introduction"] } },
                { id: "rest-api", label: "REST API Design", type: "default", category: "core", data: { description: "Design scalable APIs", resources: ["https://restfulapi.net/"] } },
                { id: "project", label: "API Project", type: "output", category: "project", data: { description: "Build a full REST API", resources: [] } },
            ],
            edges: [
                { id: "e1", source: "js-basics", target: "nodejs" },
                { id: "e2", source: "nodejs", target: "express" },
                { id: "e3", source: "express", target: "sql" },
                { id: "e4", source: "express", target: "mongodb", edgeType: "branch" },
                { id: "e5", source: "sql", target: "auth" },
                { id: "e6", source: "auth", target: "rest-api" },
                { id: "e7", source: "rest-api", target: "project" },
            ],
        },
    },
    {
        id: "python-data",
        title: "Python for Data Science",
        description: "Learn Python and data analysis fundamentals",
        category: "Data Science",
        icon: "📊",
        difficulty: "beginner",
        estimatedTime: "3-4 months",
        roadmap: {
            title: "Python Data Science Roadmap",
            nodes: [
                { id: "python-basics", label: "Python Basics", type: "input", category: "core", data: { description: "Learn Python fundamentals", resources: ["https://docs.python.org/3/tutorial/", "https://www.learnpython.org/"] } },
                { id: "numpy", label: "NumPy", type: "default", category: "core", data: { description: "Numerical computing", resources: ["https://numpy.org/doc/stable/"] } },
                { id: "pandas", label: "Pandas", type: "default", category: "core", data: { description: "Data manipulation", resources: ["https://pandas.pydata.org/docs/"] } },
                { id: "matplotlib", label: "Matplotlib & Seaborn", type: "default", category: "core", data: { description: "Data visualization", resources: ["https://matplotlib.org/stable/tutorials/"] } },
                { id: "statistics", label: "Statistics", type: "default", category: "core", data: { description: "Statistical foundations", resources: ["https://www.khanacademy.org/math/statistics-probability"] } },
                { id: "sklearn", label: "Scikit-learn", type: "default", category: "advanced", data: { description: "Machine learning basics", resources: ["https://scikit-learn.org/stable/tutorial/"] } },
                { id: "project", label: "Data Analysis Project", type: "output", category: "project", data: { description: "Analyze a real dataset", resources: ["https://www.kaggle.com/datasets"] } },
            ],
            edges: [
                { id: "e1", source: "python-basics", target: "numpy" },
                { id: "e2", source: "numpy", target: "pandas" },
                { id: "e3", source: "pandas", target: "matplotlib" },
                { id: "e4", source: "pandas", target: "statistics" },
                { id: "e5", source: "matplotlib", target: "sklearn" },
                { id: "e6", source: "statistics", target: "sklearn" },
                { id: "e7", source: "sklearn", target: "project" },
            ],
        },
    },
    {
        id: "mobile-react-native",
        title: "Mobile App Development",
        description: "Build cross-platform mobile apps with React Native",
        category: "Mobile Development",
        icon: "📱",
        difficulty: "intermediate",
        estimatedTime: "4-5 months",
        roadmap: {
            title: "React Native Roadmap",
            nodes: [
                { id: "js", label: "JavaScript & ES6+", type: "input", category: "core", data: { description: "Modern JavaScript features", resources: ["https://javascript.info/"] } },
                { id: "react", label: "React Fundamentals", type: "default", category: "core", data: { description: "Component-based UI", resources: ["https://react.dev/"] } },
                { id: "rn-basics", label: "React Native Basics", type: "default", category: "core", data: { description: "Core components & APIs", resources: ["https://reactnative.dev/docs/getting-started"] } },
                { id: "navigation", label: "Navigation", type: "default", category: "core", data: { description: "React Navigation library", resources: ["https://reactnavigation.org/"] } },
                { id: "state", label: "State Management", type: "default", category: "core", data: { description: "Redux or Zustand", resources: ["https://redux.js.org/", "https://zustand-demo.pmnd.rs/"] } },
                { id: "native-modules", label: "Native Modules", type: "default", category: "advanced", data: { description: "Bridge to native code", resources: ["https://reactnative.dev/docs/native-modules-intro"] } },
                { id: "project", label: "Mobile App Project", type: "output", category: "project", data: { description: "Build a complete mobile app", resources: [] } },
            ],
            edges: [
                { id: "e1", source: "js", target: "react" },
                { id: "e2", source: "react", target: "rn-basics" },
                { id: "e3", source: "rn-basics", target: "navigation" },
                { id: "e4", source: "rn-basics", target: "state" },
                { id: "e5", source: "navigation", target: "native-modules" },
                { id: "e6", source: "state", target: "project" },
                { id: "e7", source: "native-modules", target: "project", edgeType: "branch" },
            ],
        },
    },
];

export function getTemplateById(id: string): RoadmapTemplate | undefined {
    return roadmapTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): RoadmapTemplate[] {
    return roadmapTemplates.filter(t => t.category === category);
}

export function getAllCategories(): string[] {
    return [...new Set(roadmapTemplates.map(t => t.category))];
}
