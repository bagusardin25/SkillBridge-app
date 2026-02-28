import { Link } from "react-router-dom";
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
} from "lucide-react";
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
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Glow blobs */}
            <div className="landing-glow-blob landing-glow-blob-1" />
            <div className="landing-glow-blob landing-glow-blob-2" />
            <div className="landing-glow-blob landing-glow-blob-3" />

            {/* Grain overlay */}
            <div className="landing-grain" />

            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                {/* Badge */}
                <div className="scroll-reveal scroll-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300 mb-8">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    AI-Powered Learning Platform
                </div>

                {/* Headline */}
                <h1 className="scroll-reveal scroll-delay-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
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

                {/* CTA Buttons */}
                <div className="scroll-reveal scroll-delay-4 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/register"
                        className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-base transition-all duration-300 hover:bg-gray-200 hover:scale-105"
                    >
                        Start Learning
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="#features"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 hover:border-white/40 text-white font-semibold text-base transition-all duration-300 hover:bg-white/5"
                    >
                        Learn More
                        <ChevronDown className="w-4 h-4" />
                    </a>
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

    const frameRef = useRef<HTMLDivElement>(null);

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
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {previewTabs.map((t, i) => (
                        <button
                            key={t.id}
                            onClick={() => handleTabClick(i)}
                            className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden ${activeTab === i
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

                {/* 3D Browser mockup wrapper */}
                <div
                    className="landing-preview-wrapper"
                >
                    {/* Floating glow behind the frame */}
                    <div className="landing-preview-glow" />

                    {/* Browser frame with 3D tilt */}
                    <div
                        ref={frameRef}
                        className="landing-browser-frame"
                    >
                        {/* Browser top bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#262626] bg-[#050505]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-green-500/70" />
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

// ─── CTA Section ───────────────────────────────────────────
function CTASection() {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                <h2 className="scroll-reveal text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    Ready to start your{" "}
                    <span className="landing-gradient-text">learning journey</span>?
                </h2>
                <p className="scroll-reveal scroll-delay-1 text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                    Join SkillBridge today and let AI build your personalized roadmap. It's free to get started.
                </p>
                <Link
                    to="/register"
                    className="scroll-reveal scroll-delay-2 group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-black font-semibold text-lg transition-all duration-300 hover:bg-gray-200 hover:scale-105"
                >
                    Get Started — It's Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
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
export function LandingPage() {
    useScrollReveal();
    const spotlightRef = useCursorSpotlight();

    return (
        <div className="landing-page">
            {/* Cursor-following spotlight */}
            <div ref={spotlightRef} className="landing-cursor-spotlight" />

            <Navbar />
            <HeroSection />
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
            <CTASection />
            <Footer />
        </div>
    );
}
