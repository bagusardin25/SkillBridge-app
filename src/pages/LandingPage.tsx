import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import {
    Sparkles,
    Brain,
    BarChart3,
    Moon,
    GitFork,
    MessageSquare,
    ArrowRight,
    ChevronDown,
    Zap,
    Target,
    BookOpen,
    XCircle,
    CheckCircle,
    Check
} from "lucide-react";
import { HeroRoadmapDemo } from "@/components/landing/HeroRoadmapDemo";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Scroll Reveal Hook ────────────────────────────────────
function useScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        const elements = document.querySelectorAll(
            ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale"
        );
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}

// ─── Cursor Spotlight Hook ─────────────────────────────────
function useCursorSpotlight() {
    const spotlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only enable spotlight on devices that support hover (desktops/laptops)
        // to save CPU/Battery on mobile decives.
        const isHoverSupported = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!isHoverSupported) return;

        const el = spotlightRef.current;
        if (!el) return;

        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                el.style.setProperty("--cursor-x", `${e.clientX}px`);
                el.style.setProperty("--cursor-y", `${e.clientY}px`);
                el.style.setProperty("--cursor-opacity", "1");
            });
        };

        const handleMouseLeave = () => {
            el.style.setProperty("--cursor-opacity", "0");
        };

        document.addEventListener("mousemove", handleMouseMove, { passive: true });
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            cancelAnimationFrame(rafId);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return spotlightRef;
}

function useTypewriter(texts: string[], typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000) {
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const i = loopNum % texts.length;
        const fullText = texts[i];

        if (isDeleting) {
            timer = setTimeout(() => {
                setCurrentText(fullText.substring(0, currentText.length - 1));
            }, deletingSpeed);
        } else {
            timer = setTimeout(() => {
                setCurrentText(fullText.substring(0, currentText.length + 1));
            }, typingSpeed);
        }

        if (!isDeleting && currentText === fullText) {
            timer = setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && currentText === '') {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
        }

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, loopNum, texts, typingSpeed, deletingSpeed, pauseTime]);

    return currentText;
}

function use3DTilt(maxTilt = 12) {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Disable on touch devices
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        ref.current.style.transition = 'transform 0.1s ease-out';
    }, [maxTilt]);

    const handleMouseLeave = useCallback(() => {
        if (!ref.current) return;
        ref.current.style.transform = `perspective(1000px) rotateX(4deg) rotateY(0deg) scale3d(1, 1, 1)`;
        ref.current.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    }, []);

    return { ref, handleMouseMove, handleMouseLeave };
}

function useCursorGlow() {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ref.current.style.setProperty('--x', `${x}px`);
        ref.current.style.setProperty('--y', `${y}px`);
    }, []);

    return { ref, handleMouseMove };
}

// ─── Navbar ────────────────────────────────────────────────
function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "landing-nav-scrolled"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Logo size={32} />
                    <span className="text-xl font-bold text-white">SkillBridge</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
                    <a href="#features" className="hover:text-white transition-colors">
                        Features
                    </a>
                    <a href="#preview" className="hover:text-white transition-colors">
                        Preview
                    </a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">
                        How It Works
                    </a>
                    <a href="#faq" className="hover:text-white transition-colors">
                        FAQ
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:inline-block"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-medium transition-all duration-300 hover:bg-gray-200"
                    >
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// ─── Hero Section ──────────────────────────────────────────
function HeroSection() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/register?goal=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate("/register");
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Interactive React Flow Background */}
            <HeroRoadmapDemo />

            {/* Glow blobs (put below z-10 text, above React Flow) */}
            <div className="landing-glow-blob landing-glow-blob-1 pointer-events-none" />
            <div className="landing-glow-blob landing-glow-blob-2 pointer-events-none" />
            <div className="landing-glow-blob landing-glow-blob-3 pointer-events-none" />

            {/* Grain overlay */}
            <div className="landing-grain pointer-events-none" />

            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full">
                {/* Badge */}
                <div className="scroll-reveal scroll-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300 mb-8 mt-12 sm:mt-0">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    AI-Powered Learning Platform
                </div>

                {/* Headline */}
                <h1 className="scroll-reveal scroll-delay-2 text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                    Build Your Learning{" "}
                    <br className="hidden sm:block" />
                    Path with{" "}
                    <span className="landing-gradient-text">AI.</span>
                </h1>

                {/* Sub-headline */}
                <p className="scroll-reveal scroll-delay-3 mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Describe your goal, and AI will create a personalized roadmap
                    to guide your learning journey — structured, visual, and interactive.
                </p>

                {/* Interactive Prompt Input */}
                <div className="scroll-reveal scroll-delay-4 mt-8 max-w-2xl mx-auto w-full">
                    <form
                        onSubmit={handleSearch}
                        className="relative flex items-center w-full group"
                    >
                        {/* Glow effect behind input */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-purple-600/30 blur-xl group-focus-within:opacity-100 opacity-50 transition-opacity rounded-full z-0" />

                        <div className="relative flex items-center w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 group-focus-within:border-violet-500/50 rounded-full p-2 z-10 transition-colors shadow-2xl">
                            <div className="pl-4 pr-2 text-gray-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`What do you want to learn? (e.g. ${useTypewriter([
                                    "Golang Backend",
                                    "React UI/UX",
                                    "Data Science",
                                    "System Design",
                                    "iOS Development"
                                ])})`}
                                className="flex-1 bg-transparent border-none outline-none text-white text-base sm:text-lg px-2 h-12 w-full placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-6 py-3 h-12 rounded-full bg-white text-black font-bold text-sm sm:text-base transition-all duration-300 hover:bg-gray-200 hover:scale-105 shrink-0"
                            >
                                <span className="hidden sm:inline">Generate Roadmap</span>
                                <span className="sm:hidden">Start</span>
                                <Sparkles className="w-4 h-4 ml-1 text-violet-600" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
                        <span className="shrink-0">Popular:</span>
                        {["Fullstack React", "Data Science", "System Design", "UI/UX"].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setSearchQuery(tag)}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="scroll-reveal scroll-delay-5 mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-center">
                    {[
                        { value: "AI", label: "Powered Roadmaps" },
                        { value: "∞", label: "Topics Available" },
                        { value: "100%", label: "Free to Start" },
                    ].map((stat) => (
                        <div key={stat.label} className="group">
                            <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-gray-300 transition-colors">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>
        </section>
    );
}

// ─── Social Proof Section ──────────────────────────────────
function SocialProofSection() {
    const techStack = [
        { name: "React", icon: "⚛️" },
        { name: "TypeScript", icon: "📘" },
        { name: "Tailwind CSS", icon: "🌊" },
        { name: "React Flow", icon: "🔀" },
        { name: "Node.js", icon: "🟩" },
        { name: "OpenAI GPT-4", icon: "🧠" },
        { name: "PostgreSQL", icon: "🐘" },
    ];

    // Duplicate array multiple times for seamless infinite scroll
    const marqueeItems = [...techStack, ...techStack, ...techStack, ...techStack];

    return (
        <section className="relative py-10 border-b border-white/5 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col items-center">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-[#121212] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-[#121212] to-transparent z-10 pointer-events-none" />

            <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-6 z-10">
                Powered by industry-leading technology
            </p>

            <div className="flex w-full overflow-hidden">
                <div className="flex gap-12 sm:gap-24 items-center animate-marquee opacity-50 transition-opacity duration-300">
                    {marqueeItems.map((tech, i) => (
                        <div key={i} className="flex items-center gap-3 whitespace-nowrap text-xl sm:text-2xl font-bold text-gray-300 grayscale hover:grayscale-0 transition-all cursor-default">
                            <span>{tech.icon}</span>
                            <span>{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Comparison Section ────────────────────────────────────
function ComparisonSection() {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Glows */}
            <div className="absolute top-1/2 left-1/2 md:left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-red-500/[0.02] rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 md:left-3/4 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-emerald-500/[0.03] rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
                        Why We Built This
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                        A smarter way to learn
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* The Old Way */}
                    <div className="scroll-reveal scroll-delay-1 p-6 sm:p-8 rounded-2xl bg-[#120808]/80 border border-red-900/20 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <XCircle className="w-6 h-6 text-red-500" />
                            <h3 className="text-2xl font-bold text-gray-300">The Old Way</h3>
                        </div>
                        <ul className="space-y-4 flex-1">
                            {[
                                "Opening 20+ YouTube tabs trying to find where to start",
                                "Reading confusing documentation without clear context",
                                "Getting stuck on a bug with no one to ask for help",
                                "Losing motivation because the end goal feels too far",
                                "Not knowing if you're learning the right things in order"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-400">
                                    <span className="text-red-500/50 mt-1">✗</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* The SkillBridge Way */}
                    <div className="scroll-reveal scroll-delay-2 p-6 sm:p-8 rounded-2xl bg-[#05120a]/80 border border-emerald-900/30 flex flex-col h-full relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10" />

                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            <h3 className="text-2xl font-bold text-white">SkillBridge</h3>
                        </div>
                        <ul className="space-y-4 flex-1">
                            {[
                                "One AI-generated roadmap tailored to your exact goal",
                                "Curated steps organized in logical progression",
                                "Chat with an AI Tutor anytime you get stuck on a topic",
                                "Track progress with visual milestones and streak counters",
                                "Interactive quizzes to validate your understanding"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-300 font-medium">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Features Section ──────────────────────────────────────
const features = [
    {
        icon: Sparkles,
        title: "AI-Powered Roadmaps",
        description:
            "Just describe your learning goal, and AI generates a structured step-by-step roadmap tailored to your needs.",
        color: "violet",
        className: "md:col-span-2 md:row-span-2 flex flex-col justify-center",
        titleClass: "text-2xl",
    },
    {
        icon: GitFork,
        title: "Visual Flowchart Editor",
        description:
            "Interactive node-based canvas powered by React Flow. Drag, connect, and organize your learning path visually.",
        color: "blue",
        className: "md:col-span-2",
        titleClass: "text-lg",
    },
    {
        icon: Brain,
        title: "Smart Quiz System",
        description:
            "Test your knowledge with AI-generated quizzes. Track what you've mastered and what needs review.",
        color: "purple",
        className: "md:col-span-1",
        titleClass: "text-lg",
    },
    {
        icon: MessageSquare,
        title: "AI Chat Assistant",
        description:
            "Click any node to dive deeper. Chat with AI about that specific topic to get detailed explanations.",
        color: "emerald",
        className: "md:col-span-1",
        titleClass: "text-lg",
    },
    {
        icon: BarChart3,
        title: "Progress Tracking",
        description:
            "Monitor your learning streak, time spent, and completion rate. Stay motivated with visual progress indicators.",
        color: "amber",
        className: "md:col-span-2",
        titleClass: "text-lg",
    },
    {
        icon: Moon,
        title: "Dark Mode",
        description:
            "Easy on the eyes, day or night. A beautifully crafted dark theme for comfortable extended learning sessions.",
        color: "slate",
        className: "md:col-span-2",
        titleClass: "text-lg",
    },
];

const colorMap: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    slate: "from-slate-500/20 to-slate-600/5 border-slate-500/20 text-slate-400",
};

function FeaturesSection() {
    return (
        <section id="features" className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Ambient glows for richer background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Section header */}
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
                        Everything You Need
                    </p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                        Why learners choose SkillBridge?
                    </h2>
                    <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
                        All the tools you need to build a clear, AI-generated learning path — in one elegant platform.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        const colors = colorMap[feature.color] || colorMap.violet;
                        return (
                            <div
                                key={feature.title}
                                className={`scroll-reveal scroll-delay-${i + 1} landing-feature-card group ${feature.className}`}
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className={`${feature.titleClass} font-semibold text-white mb-2`}>
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ─── App Preview Section ───────────────────────────────────
const previewTabs = [
    {
        id: "roadmap",
        label: "AI Roadmap",
        image: "/screenshots/app-roadmap.png",
        title: "Interactive Visual Roadmaps",
        description:
            "AI generates a structured learning path as a beautiful flowchart. Each node represents a topic, connected in the optimal learning order.",
    },
    {
        id: "details",
        label: "Resources",
        image: "/screenshots/app-node-details.png",
        title: "Rich Learning Resources",
        description:
            "Click any node to see curated resources — videos, articles, and documentation. Track your progress with quiz milestones.",
    },
    {
        id: "ai-tutor",
        label: "AI Tutor",
        image: "/screenshots/app-ai-tutor.png",
        title: "Personal AI Tutor",
        description:
            "Stuck on a concept? Chat with the AI tutor for contextual explanations. It understands exactly which topic you're studying.",
    },
    {
        id: "quiz",
        label: "Quiz",
        image: "/screenshots/app-quiz.png",
        title: "AI-Generated Quizzes",
        description:
            "Test your understanding with auto-generated quizzes. Timed, multiple choice, and fully adaptive to each topic node.",
    },
];

function AppPreviewSection() {
    const [activeTab, setActiveTab] = useState(0);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isPausedRef = useRef(false);
    const { ref: tiltRef, handleMouseMove, handleMouseLeave } = use3DTilt(8);

    const AUTO_CYCLE_MS = 4000;
    const TICK_MS = 40;

    const startCycle = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(0);
        intervalRef.current = setInterval(() => {
            if (isPausedRef.current) return;
            setProgress((prev) => {
                if (prev >= 100) {
                    setActiveTab((t) => (t + 1) % previewTabs.length);
                    return 0;
                }
                return prev + (TICK_MS / AUTO_CYCLE_MS) * 100;
            });
        }, TICK_MS);
    }, []);

    useEffect(() => {
        startCycle();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startCycle]);

    const frameRef = tiltRef;

    const handleTabClick = (index: number) => {
        setActiveTab(index);
        setProgress(0);
        startCycle();

        // Trigger scale animation on tab switch
        const frame = frameRef.current;
        if (frame) {
            frame.classList.remove("tab-switching");
            void frame.offsetWidth; // force reflow
            frame.classList.add("tab-switching");
        }
    };

    const tab = previewTabs[activeTab];

    return (
        <section id="preview" className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                {/* Section header */}
                <div className="scroll-reveal text-center mb-12">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
                        See It In Action
                    </p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                        A glimpse into SkillBridge
                    </h2>
                    <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
                        Real screenshots from the app — explore the core experience.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex sm:flex-wrap justify-start sm:justify-center gap-2 mb-8 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar snap-x">
                    {previewTabs.map((t, i) => (
                        <button
                            key={t.id}
                            onClick={() => handleTabClick(i)}
                            className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap snap-center shrink-0 ${activeTab === i
                                ? "bg-white/10 text-white border border-white/20"
                                : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            {/* Progress bar inside active tab */}
                            {activeTab === i && (
                                <span
                                    className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500 transition-none rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            )}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* 3D Browser Mockup Wrapper */}
                <div
                    className="scroll-reveal scroll-delay-2 landing-preview-wrapper max-w-5xl mx-auto"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={() => {
                        isPausedRef.current = true;
                    }}
                >
                    <div className="landing-preview-glow" />

                    {/* Browser Frame */}
                    <div
                        ref={frameRef}
                        className="landing-browser-frame transition-all duration-300 relative z-10"
                        style={{ transform: 'perspective(1000px) rotateX(4deg) rotateY(0deg)' }}
                    >
                        {/* Fake Browser Chrome */}
                        <div className="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 gap-4">
                            {/* Window controls */}
                            <div className="flex gap-2 shrink-0">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-gray-500 font-mono">
                                    skillbridge.app
                                </div>
                            </div>
                        </div>

                        {/* Screenshot with smooth crossfade */}
                        <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                            {previewTabs.map((t, i) => (
                                <img
                                    key={t.id}
                                    src={t.image}
                                    alt={t.title}
                                    className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${activeTab === i ? "opacity-100" : "opacity-0"
                                        }`}
                                />
                            ))}

                            {/* Subtle bottom gradient overlay */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#020202] to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Reflection / shadow underneath */}
                    <div className="landing-preview-reflection" />
                </div>

                {/* Active tab description */}
                <div className="mt-8 text-center max-w-2xl mx-auto">
                    <h3
                        key={tab.id + "-title"}
                        className="text-xl sm:text-2xl font-semibold text-white mb-3 landing-fade-in"
                    >
                        {tab.title}
                    </h3>
                    <p
                        key={tab.id + "-desc"}
                        className="text-gray-400 leading-relaxed landing-fade-in"
                    >
                        {tab.description}
                    </p>
                </div>
            </div>
        </section>
    );
}

// ─── How It Works ──────────────────────────────────────────
const steps = [
    {
        icon: Target,
        step: "01",
        title: "Describe Your Goal",
        description:
            "Type what you want to learn — \"I want to become a backend developer\" or \"Teach me Go from scratch\".",
    },
    {
        icon: Zap,
        step: "02",
        title: "Get Your Roadmap",
        description:
            "AI instantly generates a visual, structured learning path as an interactive flowchart with clear milestones.",
    },
    {
        icon: BookOpen,
        step: "03",
        title: "Start Learning",
        description:
            "Follow the roadmap step by step. Click any node for detailed explanations, resources, and AI-powered Q&A.",
    },
];

function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
                        Simple & Powerful
                    </p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
                        How it works
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.step} className={`scroll-reveal scroll-delay-${i + 1} relative group`}>
                                {/* Connector line */}
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-white/10 to-transparent" />
                                )}

                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-[#080808] border border-[#262626] mb-6 group-hover:border-gray-500/40 transition-all duration-300">
                                        <Icon className="w-10 h-10 text-violet-400" />
                                        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
                                            {s.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">
                                        {s.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {s.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ─── Testimonial Section ───────────────────────────────────
function TestimonialSection() {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <blockquote className="scroll-reveal-scale text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    "The best way to learn is with a{" "}
                    <span className="landing-gradient-text">clear roadmap</span>,{" "}
                    <br className="hidden sm:block" />
                    and a guide who never sleeps."
                </blockquote>
                <div className="scroll-reveal scroll-delay-2 mt-8 flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        S
                    </div>
                    <div className="text-left">
                        <p className="text-white font-semibold">SkillBridge</p>
                        <p className="text-gray-400 text-sm">AI Learning Platform</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── FAQ Section ───────────────────────────────────────────
const faqs = [
    {
        question: "Is SkillBridge free?",
        answer:
            "Yes! SkillBridge is free to get started. You can generate AI roadmaps, use the visual editor, and track your progress at no cost.",
    },
    {
        question: "What topics can I learn?",
        answer:
            "Anything! From programming languages like Python and Go, to broader goals like \"Become a Full-Stack Developer\" or \"Learn System Design\".",
    },
    {
        question: "How does the AI generate roadmaps?",
        answer:
            "SkillBridge uses advanced AI (GPT/Gemini) to act as a curriculum architect. It breaks down your goal into structured learning steps with logical ordering.",
    },
    {
        question: "Can I edit the generated roadmap?",
        answer:
            "Absolutely! The visual flowchart editor lets you drag, rearrange, add, or remove nodes to customize the roadmap to your preferences.",
    },
    {
        question: "Is my data saved?",
        answer:
            "Yes. Your roadmaps and progress are saved securely. You can access them anytime from any device after logging in.",
    },
    {
        question: "Do I need an account?",
        answer:
            "Yes, a free account is required to save your roadmaps and track progress. You can sign up with email, Google, or GitHub.",
    },
];

function FAQSection() {
    return (
        <section id="faq" className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
                        All About SkillBridge
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                        Frequently asked questions
                    </h2>
                    <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
                        Get quick answers to the most common questions about SkillBridge and how it can help your learning journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {faqs.map((faq, i) => (
                        <div key={faq.question} className={`scroll-reveal scroll-delay-${(i % 2) + 1} space-y-3`}>
                            <h3 className="text-white font-semibold text-lg">
                                {faq.question}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Pricing Section ───────────────────────────────────────
function PricingSection() {
    const { ref: glowRef, handleMouseMove } = useCursorGlow();

    return (
        <section className="relative py-24 sm:py-32 overflow-hidden">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
                        Simple Pricing
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                        Start learning for free
                    </h2>
                    <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
                        We're currently in Beta. Join now to lock in your free access.
                    </p>
                </div>

                <div className="scroll-reveal scroll-delay-2 relative max-w-lg mx-auto">
                    {/* Glowing background behind pricing card */}
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-600/30 to-purple-800/10 blur-2xl rounded-3xl" />

                    <div
                        ref={glowRef}
                        onMouseMove={handleMouseMove}
                        className="landing-pricing-card relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col group overflow-hidden"
                    >
                        {/* Interactive Cursor Flashlight inside pricing card */}
                        <div
                            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                            style={{
                                background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(139, 92, 246, 0.15), transparent 40%)`
                            }}
                        />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white">Beta User</h3>
                                    <p className="text-gray-400 mt-1 text-sm sm:text-base">Full access to all features</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-xs sm:text-sm font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20">
                                    Limited Time
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-8 border-b border-white/5 pb-8">
                                <span className="text-4xl sm:text-5xl font-extrabold text-white">$0</span>
                                <span className="text-gray-400">/month</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {[
                                    "Unlimited AI Roadmaps",
                                    "Unlimited AI Tutor chats",
                                    "Progress tracking & Analytics",
                                    "AI Quiz Generation",
                                    "Community Discord access"
                                ].map((feature, i) => (
                                    <li key={i} className="flex gap-3 items-center text-gray-300">
                                        <Check className="w-5 h-5 text-violet-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className="w-full inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-white text-black font-bold text-lg transition-all hover:bg-gray-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                            >
                                Claim Free Account
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Footer ────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="relative border-t border-[#262626] py-8">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Logo size={24} />
                    <span className="text-sm font-semibold text-gray-400">
                        SkillBridge
                    </span>
                </div>
                <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} SkillBridge. Built for Education & Upskilling.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                    <Link to="/login" className="hover:text-gray-300 transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="hover:text-gray-300 transition-colors">
                        Sign Up
                    </Link>
                </div>
            </div>
        </footer>
    );
}

// ─── Landing Page (Main Export) ────────────────────────────
function AnimatedBackgroundLines() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 flex justify-between px-[5%] sm:px-[10%] lg:px-[15%]">
            <div className="w-px h-full bg-white/[0.03] relative overflow-hidden">
                <div className="absolute top-0 w-full h-[30vh] bg-gradient-to-b from-transparent via-violet-500/80 to-transparent animate-data-flow blur-[2px]" />
            </div>
            <div className="w-px h-full bg-white/[0.03] relative overflow-hidden hidden md:block">
                <div className="absolute top-0 w-full h-[40vh] bg-gradient-to-b from-transparent via-purple-500/80 to-transparent animate-data-flow-delayed blur-[2px]" />
            </div>
            <div className="w-px h-full bg-white/[0.03] relative overflow-hidden">
                <div className="absolute top-0 w-full h-[25vh] bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent animate-data-flow blur-[2px]" style={{ animationDelay: '-7s', animationDuration: '12s' }} />
            </div>
        </div>
    );
}

export function LandingPage() {
    useScrollReveal();
    const spotlightRef = useCursorSpotlight();

    return (
        <div className="landing-page">
            <AnimatedBackgroundLines />

            {/* Cursor-following spotlight */}
            <div ref={spotlightRef} className="landing-cursor-spotlight" />

            <Navbar />
            <HeroSection />
            <hr className="landing-section-divider" />
            <ComparisonSection />
            <hr className="landing-section-divider" />
            <FeaturesSection />
            <hr className="landing-section-divider" />
            <AppPreviewSection />
            <hr className="landing-section-divider" />
            <HowItWorksSection />
            <hr className="landing-section-divider" />
            <TestimonialSection />
            <hr className="landing-section-divider" />
            <FAQSection />
            <hr className="landing-section-divider" />
            <PricingSection />
            <hr className="landing-section-divider" />
            <SocialProofSection />
            <Footer />
        </div>
    );
}
