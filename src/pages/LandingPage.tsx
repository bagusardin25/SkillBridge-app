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
    Check,
    Globe,
    Sun,
    Menu,
    X
} from "lucide-react";
import { StaticRoadmapVisual } from "@/components/landing/HeroRoadmapDemo";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { LanguageDialog } from "@/components/ui/LanguageDialog";
import { getTranslations, getStoredLanguage, type Language, type Translations } from "@/lib/translations";

// ─── Language Hook ─────────────────────────────────────────
function useLanguage(): Translations {
    const [lang, setLang] = useState<Language>(getStoredLanguage);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail === "en" || detail === "id") setLang(detail);
        };
        window.addEventListener("languageChange", handler);
        return () => window.removeEventListener("languageChange", handler);
    }, []);

    return getTranslations(lang);
}

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
function Navbar({ t }: { t: Translations }) {
    const [scrolled, setScrolled] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useRoadmapStore();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMobileMenuOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileMenuOpen]);

    const mobileNavLinks = [
        { href: "#features", label: t.nav.features, icon: Sparkles },
        { href: "#preview", label: t.nav.preview, icon: BookOpen },
        { href: "#how-it-works", label: t.nav.howItWorks, icon: Zap },
        { href: "#faq", label: t.nav.faq, icon: MessageSquare },
    ];

    const handleMobileNavClick = (href: string) => {
        setMobileMenuOpen(false);
        // Small delay to let menu close animation play
        setTimeout(() => {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 200);
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "landing-nav-scrolled"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo size={32} />
                        <span className="text-xl font-bold text-foreground dark:text-white transition-colors">SkillBridge</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground dark:text-gray-300">
                        <a href="#features" className="hover:text-foreground dark:hover:text-white transition-colors">
                            {t.nav.features}
                        </a>
                        <a href="#preview" className="hover:text-foreground dark:hover:text-white transition-colors">
                            {t.nav.preview}
                        </a>
                        <a href="#how-it-works" className="hover:text-foreground dark:hover:text-white transition-colors">
                            {t.nav.howItWorks}
                        </a>
                        <a href="#faq" className="hover:text-foreground dark:hover:text-white transition-colors">
                            {t.nav.faq}
                        </a>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-full transition-colors hidden sm:flex items-center justify-center"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLangOpen(true)}
                            className="text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-full transition-colors hidden sm:flex items-center justify-center"
                            aria-label="Change language"
                        >
                            <Globe className="h-4 w-4" />
                        </button>

                        <Link
                            to="/login"
                            className="text-sm text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white transition-colors hidden sm:inline-block ml-2"
                        >
                            {t.nav.login}
                        </Link>
                        <Link
                            to="/register"
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-foreground dark:bg-white text-background dark:text-black text-sm font-medium transition-all duration-300 hover:opacity-90 dark:hover:bg-gray-200"
                        >
                            {t.nav.getStarted}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-1"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                
                {/* Language Dialog */}
                <LanguageDialog open={langOpen} onOpenChange={setLangOpen} />
            </nav>

            {/* ─── Mobile Menu Overlay ───────────────────────────── */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
                    mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div
                className={`fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300 ease-out ${
                    mobileMenuOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                }`}
            >
                <div className="mx-4 mt-2 rounded-2xl bg-background/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border border-border dark:border-white/10 shadow-2xl overflow-hidden transition-colors">
                    {/* Quick Navigation Links */}
                    <div className="p-3">
                        <p className="px-3 pt-2 pb-3 text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground dark:text-gray-500 transition-colors">
                            Quick Access
                        </p>
                        <div className="space-y-1">
                            {mobileNavLinks.map((link, i) => {
                                const Icon = link.icon;
                                return (
                                    <button
                                        key={link.href}
                                        onClick={() => handleMobileNavClick(link.href)}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-foreground dark:text-white hover:bg-violet-500/10 dark:hover:bg-violet-500/15 transition-all duration-200 group"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 dark:bg-violet-500/15 flex items-center justify-center group-hover:bg-violet-500/20 dark:group-hover:bg-violet-500/25 transition-colors">
                                            <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <span className="text-sm font-medium">{link.label}</span>
                                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground dark:text-gray-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-border dark:bg-white/5 transition-colors" />

                    {/* Utility Row: Theme, Language, Login */}
                    <div className="p-3 flex items-center gap-2">
                        <button
                            onClick={() => { toggleTheme(); }}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            <span className="text-xs">{isDarkMode ? "Light" : "Dark"}</span>
                        </button>
                        <button
                            onClick={() => { setMobileMenuOpen(false); setLangOpen(true); }}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Change language"
                        >
                            <Globe className="h-4 w-4" />
                            <span className="text-xs">Language</span>
                        </button>
                        <div className="flex-1" />
                        <Link
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-2.5 text-sm font-medium text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            {t.nav.login}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Hero Section ──────────────────────────────────────────
function HeroSection({ t }: { t: Translations }) {
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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
            {/* Glow blobs */}
            <div className="landing-glow-blob landing-glow-blob-1 pointer-events-none" />
            <div className="landing-glow-blob landing-glow-blob-2 pointer-events-none" />
            <div className="landing-glow-blob landing-glow-blob-3 pointer-events-none" />

            {/* Floating decorative orbs */}
            <div className="absolute top-[15%] left-[8%] w-20 h-20 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-xl landing-float pointer-events-none" />
            <div className="absolute top-[35%] right-[5%] w-14 h-14 rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-500/15 blur-lg landing-float-delayed pointer-events-none" />
            <div className="absolute bottom-[20%] left-[15%] w-24 h-24 rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 blur-2xl landing-float-slow pointer-events-none" />
            <div className="absolute top-[60%] right-[12%] w-10 h-10 rounded-full bg-purple-400/15 dark:bg-purple-400/20 blur-md landing-float pointer-events-none hidden md:block" />

            {/* Grain overlay */}
            <div className="landing-grain pointer-events-none" />

            <div className="relative z-10 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                {/* Left Column: Text & Input */}
                <div className="w-full md:w-1/2 flex flex-col items-start text-left shrink-0">
                    {/* Badge with shimmer */}
                    <div className="scroll-reveal scroll-delay-1 landing-shimmer-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 dark:border-violet-400/20 bg-violet-500/5 dark:bg-violet-500/10 backdrop-blur-sm text-sm text-violet-700 dark:text-violet-300 mb-8 mt-4 md:mt-0 shadow-sm">
                        <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                        {t.hero.badge}
                    </div>

                    {/* Headline */}
                    <h1 className="scroll-reveal scroll-delay-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground dark:text-white leading-[1.05] tracking-tight transition-colors">
                        {t.hero.headlinePre}<br className="hidden sm:block" />
                        <span className="landing-gradient-text pb-2 drop-shadow-[0_0_25px_rgba(139,92,246,0.2)]">
                            {t.hero.headlineGradient1}<br className="hidden sm:block" />
                            {t.hero.headlineGradient2}
                        </span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="scroll-reveal scroll-delay-3 mt-6 text-lg sm:text-xl text-muted-foreground dark:text-gray-400 max-w-xl leading-relaxed transition-colors">
                        {t.hero.subheadline}
                    </p>

                    {/* Interactive Prompt Input */}
                    <div className="scroll-reveal scroll-delay-4 mt-8 w-full max-w-xl">
                        <form
                            onSubmit={handleSearch}
                            className="relative flex items-center w-full group"
                        >
                            {/* Glow effect behind input */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-purple-600/30 blur-xl group-focus-within:opacity-100 opacity-50 transition-opacity rounded-full z-0" />

                            <div className="relative flex items-center w-full bg-background/80 dark:bg-[#121212]/80 backdrop-blur-md border border-border dark:border-white/10 group-focus-within:border-violet-500/50 rounded-full p-2 z-10 transition-colors shadow-2xl">
                                <div className="pl-4 pr-2 text-muted-foreground transition-colors">
                                    <Target className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`${t.hero.placeholderPrefix}${useTypewriter(t.hero.typewriterTexts)}`}
                                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground dark:text-white text-sm md:text-base px-2 h-12 placeholder:text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="landing-cta-glow inline-flex items-center gap-2 px-5 py-2.5 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all duration-300 hover:scale-105 shrink-0"
                                >
                                    <span className="hidden sm:inline">{t.hero.startJourney}</span>
                                    <span className="sm:hidden">{t.hero.start}</span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </form>

                    </div>
                </div>

                {/* Right Column: Roadmap Demo */}
                <div className="scroll-reveal scroll-delay-5 w-full md:w-1/2 h-[500px] md:h-[600px] relative hidden md:block">
                     <StaticRoadmapVisual />
                </div>
                
                {/* Mobile Roadmap Demo (shown below text on small screens) */}
                <div className="scroll-reveal scroll-delay-5 w-full h-[400px] relative md:hidden mt-8">
                     <StaticRoadmapVisual />
                </div>
            </div>

            {/* Scroll indicator */}
            <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 p-2 cursor-pointer text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors" aria-label="Scroll to features">
                <ChevronDown className="w-6 h-6 animate-bounce" />
            </a>
        </section>
    );
}

// ─── Social Proof Section ──────────────────────────────────
function SocialProofSection({ t }: { t: Translations }) {
    const techStack = [
        { name: "React", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
        { name: "TypeScript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
        { name: "Tailwind CSS", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
        { name: "React Flow", icon: <GitFork className="w-8 h-8 text-pink-500" /> },
        { name: "Node.js", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain.svg" },
        { name: "OpenAI GPT-4", icon: <Brain className="w-8 h-8 text-foreground dark:text-white transition-colors" /> },
        { name: "PostgreSQL", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" },
    ];

    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const positionRef = useRef(0);
    
    // Smoothly interpolate speed
    const currentSpeedRef = useRef(1);

    useEffect(() => {
        const animate = () => {
            // Target speed: slow down to 0.15 on hover instead of stopping
            const targetSpeed = isHovered ? 0.15 : 1;
            
            // Lerp the speed for smooth transition
            currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * 0.05;
            
            positionRef.current -= currentSpeedRef.current;

            if (contentRef.current && containerRef.current) {
                // If we've scrolled half the duplicated content (which is 1 full set length), reset
                const halfWidth = contentRef.current.scrollWidth / 2;
                if (Math.abs(positionRef.current) >= halfWidth) {
                    positionRef.current = 0;
                }
                
                contentRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isHovered]);

    // Duplicate array multiple times for seamless infinite scroll
    const marqueeItems = [...techStack, ...techStack, ...techStack, ...techStack];

    return (
        <section className="relative py-12 flex flex-col items-center overflow-hidden">
            <p className="text-sm sm:text-base font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-6 z-10 transition-colors text-center px-6">
                {t.socialProof.title}
            </p>

            {/* Marquee Container with Top/Bottom Borders */}
            <div className="relative w-full border-y border-violet-900/20 dark:border-violet-900/40 bg-muted/20 dark:bg-[#0a0a0a]/40 backdrop-blur-sm transition-colors">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

                <div 
                    className="flex w-full overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    ref={containerRef}
                >
                    <div 
                        ref={contentRef}
                        className="flex items-center opacity-80 hover:opacity-100 transition-opacity duration-500 w-max"
                    >
                        {marqueeItems.map((tech, i) => (
                            <div 
                                key={i} 
                                className="flex items-center justify-center gap-4 sm:gap-6 w-64 sm:w-80 h-24 sm:h-32 border-r border-violet-900/20 dark:border-violet-900/40 transition-all cursor-default bg-transparent hover:bg-violet-900/5 dark:hover:bg-violet-900/10"
                            >
                                {tech.src ? (
                                    <img src={tech.src} alt={tech.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                                ) : (
                                    <div className="scale-110 sm:scale-125">{tech.icon}</div>
                                )}
                                <span className="text-lg sm:text-2xl font-bold text-muted-foreground dark:text-gray-300 tracking-wide transition-colors">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Comparison Section ────────────────────────────────────
function ComparisonSection({ t }: { t: Translations }) {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Glows */}
            <div className="absolute top-1/2 left-1/2 md:left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-red-500/[0.04] dark:bg-red-500/[0.02] rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 md:left-3/4 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-emerald-500/[0.05] dark:bg-emerald-500/[0.03] rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-600 dark:text-violet-400 mb-4 transition-colors">
                        {t.comparison.sectionLabel}
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground dark:text-white tracking-tight transition-colors">
                        {t.comparison.sectionTitle}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* The Old Way */}
                    <div className="scroll-reveal scroll-delay-1 p-6 sm:p-8 rounded-2xl bg-red-50/30 dark:bg-[#120808]/80 border border-red-200 dark:border-red-900/20 flex flex-col h-full transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <XCircle className="w-6 h-6 text-red-500" />
                            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 transition-colors">{t.comparison.oldWayTitle}</h3>
                        </div>
                        <ul className="space-y-4 flex-1">
                            {t.comparison.oldWayItems.map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-600 dark:text-gray-400 transition-colors">
                                    <span className="text-red-500/50 mt-1">✗</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* The SkillBridge Way */}
                    <div className="scroll-reveal scroll-delay-2 p-6 sm:p-8 rounded-2xl bg-emerald-50/40 dark:bg-[#05120a]/80 border border-emerald-200 dark:border-emerald-900/30 flex flex-col h-full relative overflow-hidden transition-colors">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10" />

                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            <h3 className="text-2xl font-bold text-foreground dark:text-white transition-colors">{t.comparison.newWayTitle}</h3>
                        </div>
                        <ul className="space-y-4 flex-1">
                            {t.comparison.newWayItems.map((item, i) => (
                                <li key={i} className="flex gap-3 text-gray-800 dark:text-gray-300 font-medium transition-colors">
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
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-500 dark:text-violet-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-500 dark:text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-500 dark:text-purple-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-500 dark:text-emerald-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-500 dark:text-amber-400",
    slate: "from-slate-500/20 to-slate-600/5 border-slate-500/20 text-slate-500 dark:text-slate-400",
};

function FeaturesSection({ t }: { t: Translations }) {
    return (
        <section id="features" className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Ambient glows for richer background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/[0.02] dark:bg-white/[0.015] rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/[0.02] dark:bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Section header */}
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-600 dark:text-violet-400 mb-4 transition-colors">
                        {t.features.sectionLabel}
                    </p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground dark:text-white tracking-tight transition-colors">
                        {t.features.sectionTitle}
                    </h2>
                    <p className="mt-4 text-muted-foreground dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors">
                        {t.features.sectionDescription}
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
                                <h3 className={`${feature.titleClass} font-semibold text-foreground dark:text-white mb-2 transition-colors`}>
                                    {t.features.items[i]?.title ?? feature.title}
                                </h3>
                                <p className="text-muted-foreground dark:text-gray-400 text-sm leading-relaxed transition-colors">
                                    {t.features.items[i]?.description ?? feature.description}
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

function AppPreviewSection({ t }: { t: Translations }) {
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
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-500/[0.04] dark:bg-violet-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                {/* Section header */}
                <div className="scroll-reveal text-center mb-12">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-600 dark:text-violet-400 mb-4 transition-colors">
                        {t.preview.sectionLabel}
                    </p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground dark:text-white tracking-tight transition-colors">
                        {t.preview.sectionTitle}
                    </h2>
                    <p className="mt-4 text-muted-foreground dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors">
                        {t.preview.sectionDescription}
                    </p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 mb-8">
                    {previewTabs.map((tab, i) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(i)}
                            className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${activeTab === i
                                ? "bg-muted dark:bg-white/10 text-foreground dark:text-white border border-border dark:border-white/20"
                                : "text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            {/* Progress bar inside active tab */}
                            {activeTab === i && (
                                <span
                                    className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500 transition-none rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            )}
                            {t.preview.tabs[i]?.label ?? tab.label}
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
                        className="landing-browser-frame relative z-10"
                    >
                        {/* Fake Browser Chrome */}
                        <div className="h-12 bg-muted/50 dark:bg-[#1a1a1a] border-b border-border dark:border-white/5 flex items-center px-4 gap-4 transition-colors">
                            {/* Window controls */}
                            <div className="flex gap-2 shrink-0">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="px-4 py-1 rounded-md bg-black/5 dark:bg-white/5 text-xs text-muted-foreground font-mono transition-colors">
                                    skillbridge.app
                                </div>
                            </div>
                        </div>

                        {/* Screenshot with smooth crossfade */}
                        <div className="relative aspect-[16/9] overflow-hidden bg-black/5 dark:bg-black/40 transition-colors">
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
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background dark:from-[#020202] to-transparent pointer-events-none transition-colors" />
                        </div>
                    </div>

                    {/* Reflection / shadow underneath */}
                    <div className="landing-preview-reflection" />
                </div>

                {/* Active tab description */}
                <div className="mt-8 text-center max-w-2xl mx-auto">
                    <h3
                        key={tab.id + "-title"}
                        className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white mb-3 landing-fade-in transition-colors"
                    >
                        {t.preview.tabs[activeTab]?.title ?? tab.title}
                    </h3>
                    <p
                        key={tab.id + "-desc"}
                        className="text-muted-foreground dark:text-gray-400 leading-relaxed landing-fade-in transition-colors"
                    >
                        {t.preview.tabs[activeTab]?.description ?? tab.description}
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

function HowItWorksSection({ t }: { t: Translations }) {
    return (
        <section id="how-it-works" className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/[0.02] dark:bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-600 dark:text-violet-400 mb-4 transition-colors">
                        {t.howItWorks.sectionLabel}
                    </p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground dark:text-white tracking-tight transition-colors">
                        {t.howItWorks.sectionTitle}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.step} className={`scroll-reveal scroll-delay-${i + 1} relative group landing-step-card`}>
                                {/* Connector line */}
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-violet-500/30 via-border to-transparent" />
                                )}

                                <div className="text-center">
                                    <div className="landing-step-icon relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border mb-6 group-hover:border-violet-500/40 transition-all duration-300 shadow-sm">
                                        <Icon className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                                        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground dark:bg-white text-background dark:text-black text-xs font-bold flex items-center justify-center transition-colors">
                                            {s.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3 transition-colors">
                                        {t.howItWorks.steps[i]?.title ?? s.title}
                                    </h3>
                                    <p className="text-muted-foreground dark:text-gray-400 text-sm leading-relaxed transition-colors">
                                        {t.howItWorks.steps[i]?.description ?? s.description}
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
function TestimonialSection({ t }: { t: Translations }) {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <blockquote className="scroll-reveal-scale text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground dark:text-white leading-tight transition-colors">
                    {t.testimonial.quote1}
                    <span className="landing-gradient-text">{t.testimonial.quoteHighlight}</span>
                    {t.testimonial.quote2}
                </blockquote>
                <div className="scroll-reveal scroll-delay-2 mt-8 flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        S
                    </div>
                    <div className="text-left">
                        <p className="text-foreground dark:text-white font-semibold transition-colors">SkillBridge</p>
                        <p className="text-muted-foreground dark:text-gray-400 text-sm transition-colors">{t.testimonial.subtitle}</p>
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

function FAQSection({ t }: { t: Translations }) {
    return (
        <section id="faq" className="relative py-24 sm:py-32">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-600 dark:text-violet-400 mb-4 transition-colors">
                        {t.faq.sectionLabel}
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground dark:text-white transition-colors">
                        {t.faq.sectionTitle}
                    </h2>
                    <p className="mt-4 text-muted-foreground dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors">
                        {t.faq.sectionDescription}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {t.faq.items.map((faq, i) => (
                        <div key={faq.question} className={`scroll-reveal scroll-delay-${(i % 2) + 1} space-y-3`}>
                            <h3 className="text-foreground dark:text-white font-semibold text-lg transition-colors">
                                {faq.question}
                            </h3>
                            <p className="text-muted-foreground dark:text-gray-400 text-sm leading-relaxed transition-colors">
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
function PricingSection({ t }: { t: Translations }) {
    const { ref: glowRef, handleMouseMove } = useCursorGlow();

    return (
        <section className="relative py-24 sm:py-32 overflow-hidden">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="scroll-reveal text-center mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase text-violet-600 dark:text-violet-400 mb-4 transition-colors">
                        {t.pricing.sectionLabel}
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground dark:text-white tracking-tight transition-colors">
                        {t.pricing.sectionTitle}
                    </h2>
                    <p className="mt-4 text-muted-foreground dark:text-gray-400 text-lg max-w-2xl mx-auto transition-colors">
                        {t.pricing.sectionDescription}
                    </p>
                </div>

                <div className="scroll-reveal scroll-delay-2 relative max-w-lg mx-auto">
                    {/* Glowing background behind pricing card */}
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 dark:from-violet-600/30 to-purple-800/5 dark:to-purple-800/10 blur-2xl rounded-3xl" />

                    <div
                        ref={glowRef}
                        onMouseMove={handleMouseMove}
                        className="landing-pricing-card relative bg-card/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-border dark:border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col group overflow-hidden transition-colors"
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
                                    <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white transition-colors">{t.pricing.planName}</h3>
                                    <p className="text-muted-foreground dark:text-gray-400 mt-1 text-sm sm:text-base transition-colors">{t.pricing.planDescription}</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 ring-1 ring-inset ring-violet-500/20">
                                    {t.pricing.badge}
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-8 border-b border-border dark:border-white/5 pb-8 transition-colors">
                                <span className="text-4xl sm:text-5xl font-extrabold text-foreground dark:text-white transition-colors">$0</span>
                                <span className="text-muted-foreground dark:text-gray-400 transition-colors">{t.pricing.perMonth}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {t.pricing.features.map((feature, i) => (
                                    <li key={i} className="flex gap-3 items-center text-gray-700 dark:text-gray-300 transition-colors">
                                        <Check className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className="w-full inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-foreground dark:bg-white text-background dark:text-black font-bold text-lg transition-all hover:opacity-90 dark:hover:bg-gray-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                            >
                                {t.pricing.cta}
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
function Footer({ t }: { t: Translations }) {
    return (
        <footer className="relative border-t border-border dark:border-[#262626] py-8 transition-colors">
            <div className="landing-grain" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Logo size={24} />
                    <span className="text-sm font-semibold text-muted-foreground dark:text-gray-400 transition-colors">
                        SkillBridge
                    </span>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-500 transition-colors">
                    © {new Date().getFullYear()} SkillBridge. {t.footer.copyright}
                </p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground dark:text-gray-500">
                    <Link to="/login" className="hover:text-foreground dark:hover:text-gray-300 transition-colors">
                        {t.footer.login}
                    </Link>
                    <Link to="/register" className="hover:text-foreground dark:hover:text-gray-300 transition-colors">
                        {t.footer.signUp}
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
            <div className="w-px h-full bg-border dark:bg-white/[0.03] relative overflow-hidden transition-colors">
                <div className="absolute top-0 w-full h-[30vh] bg-gradient-to-b from-transparent via-violet-500/40 dark:via-violet-500/80 to-transparent animate-data-flow blur-[2px]" />
            </div>
            <div className="w-px h-full bg-border dark:bg-white/[0.03] relative overflow-hidden hidden md:block transition-colors">
                <div className="absolute top-0 w-full h-[40vh] bg-gradient-to-b from-transparent via-purple-500/40 dark:via-purple-500/80 to-transparent animate-data-flow-delayed blur-[2px]" />
            </div>
            <div className="w-px h-full bg-border dark:bg-white/[0.03] relative overflow-hidden transition-colors">
                <div className="absolute top-0 w-full h-[25vh] bg-gradient-to-b from-transparent via-emerald-500/30 dark:via-emerald-500/50 to-transparent animate-data-flow blur-[2px]" style={{ animationDelay: '-7s', animationDuration: '12s' }} />
            </div>
        </div>
    );
}

export function LandingPage() {
    useScrollReveal();
    const spotlightRef = useCursorSpotlight();
    const t = useLanguage();

    return (
        <div className="landing-page">
            <AnimatedBackgroundLines />

            {/* Cursor-following spotlight */}
            <div ref={spotlightRef} className="landing-cursor-spotlight" />

            <Navbar t={t} />
            <HeroSection t={t} />
            <div className="mt-8 mb-16">
                <SocialProofSection t={t} />
            </div>
            <div className="landing-section-divider-gradient" />
            <ComparisonSection t={t} />
            <div className="landing-section-divider-gradient" />
            <FeaturesSection t={t} />
            <div className="landing-section-divider-gradient" />
            <AppPreviewSection t={t} />
            <div className="landing-section-divider-gradient" />
            <HowItWorksSection t={t} />
            <div className="landing-section-divider-gradient" />
            <TestimonialSection t={t} />
            <div className="landing-section-divider-gradient" />
            <FAQSection t={t} />
            <div className="landing-section-divider-gradient" />
            <PricingSection t={t} />
            <Footer t={t} />
        </div>
    );
}
