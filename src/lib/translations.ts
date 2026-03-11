// Landing page translations (EN & ID)

export type Language = "en" | "id";

export interface Translations {
  // Navbar
  nav: {
    features: string;
    preview: string;
    howItWorks: string;
    faq: string;
    login: string;
    getStarted: string;
  };

  // Hero
  hero: {
    badge: string;
    headlinePre: string;
    headlineGradient1: string;
    headlineGradient2: string;
    subheadline: string;
    placeholderPrefix: string;
    startJourney: string;
    start: string;
    typewriterTexts: string[];
  };

  // Social Proof
  socialProof: {
    title: string;
  };

  // Comparison
  comparison: {
    sectionLabel: string;
    sectionTitle: string;
    oldWayTitle: string;
    oldWayItems: string[];
    newWayTitle: string;
    newWayItems: string[];
  };

  // Features
  features: {
    sectionLabel: string;
    sectionTitle: string;
    sectionDescription: string;
    items: { title: string; description: string }[];
  };

  // App Preview
  preview: {
    sectionLabel: string;
    sectionTitle: string;
    sectionDescription: string;
    tabs: { label: string; title: string; description: string }[];
  };

  // How It Works
  howItWorks: {
    sectionLabel: string;
    sectionTitle: string;
    steps: { title: string; description: string }[];
  };

  // Testimonial
  testimonial: {
    quote1: string;
    quoteHighlight: string;
    quote2: string;
    subtitle: string;
  };

  // FAQ
  faq: {
    sectionLabel: string;
    sectionTitle: string;
    sectionDescription: string;
    items: { question: string; answer: string }[];
  };

  // Pricing
  pricing: {
    sectionLabel: string;
    sectionTitle: string;
    sectionDescription: string;
    planName: string;
    planDescription: string;
    badge: string;
    perMonth: string;
    features: string[];
    cta: string;
  };

  // Footer
  footer: {
    copyright: string;
    login: string;
    signUp: string;
  };
}

const en: Translations = {
  nav: {
    features: "Features",
    preview: "Preview",
    howItWorks: "How It Works",
    faq: "FAQ",
    login: "Login",
    getStarted: "Get Started",
  },

  hero: {
    badge: "New: GPT-4o Powered Tutoring",
    headlinePre: "Build Your ",
    headlineGradient1: "Learning Path ",
    headlineGradient2: "with AI.",
    subheadline:
      "Describe your goal, and we'll build a structured, interactive journey tailored just for you. Track your progress with XP, streaks, and an AI tutor at your side.",
    placeholderPrefix: "e.g. Become a Senior ",
    startJourney: "Start Journey",
    start: "Start",
    typewriterTexts: [
      "React Developer",
      "Go Backend Engineer",
      "Data Scientist",
      "Cloud Architect",
      "iOS Developer",
    ],
  },

  socialProof: {
    title: "Powered by industry-leading technology",
  },

  comparison: {
    sectionLabel: "Why We Built This",
    sectionTitle: "A smarter way to learn",
    oldWayTitle: "The Old Way",
    oldWayItems: [
      "Opening 20+ YouTube tabs trying to find where to start",
      "Reading confusing documentation without clear context",
      "Getting stuck on a bug with no one to ask for help",
      "Losing motivation because the end goal feels too far",
      "Not knowing if you're learning the right things in order",
    ],
    newWayTitle: "SkillBridge",
    newWayItems: [
      "One AI-generated roadmap tailored to your exact goal",
      "Curated steps organized in logical progression",
      "Chat with an AI Tutor anytime you get stuck on a topic",
      "Track progress with visual milestones and streak counters",
      "Interactive quizzes to validate your understanding",
    ],
  },

  features: {
    sectionLabel: "Everything You Need",
    sectionTitle: "Why learners choose SkillBridge?",
    sectionDescription:
      "All the tools you need to build a clear, AI-generated learning path — in one elegant platform.",
    items: [
      {
        title: "AI-Powered Roadmaps",
        description:
          "Just describe your learning goal, and AI generates a structured step-by-step roadmap tailored to your needs.",
      },
      {
        title: "Visual Flowchart Editor",
        description:
          "Interactive node-based canvas powered by React Flow. Drag, connect, and organize your learning path visually.",
      },
      {
        title: "Smart Quiz System",
        description:
          "Test your knowledge with AI-generated quizzes. Track what you've mastered and what needs review.",
      },
      {
        title: "AI Chat Assistant",
        description:
          "Click any node to dive deeper. Chat with AI about that specific topic to get detailed explanations.",
      },
      {
        title: "Progress Tracking",
        description:
          "Monitor your learning streak, time spent, and completion rate. Stay motivated with visual progress indicators.",
      },
      {
        title: "Dark Mode",
        description:
          "Easy on the eyes, day or night. A beautifully crafted dark theme for comfortable extended learning sessions.",
      },
    ],
  },

  preview: {
    sectionLabel: "See It In Action",
    sectionTitle: "A glimpse into SkillBridge",
    sectionDescription:
      "Real screenshots from the app — explore the core experience.",
    tabs: [
      {
        label: "AI Roadmap",
        title: "Interactive Visual Roadmaps",
        description:
          "AI generates a structured learning path as a beautiful flowchart. Each node represents a topic, connected in the optimal learning order.",
      },
      {
        label: "Resources",
        title: "Rich Learning Resources",
        description:
          "Click any node to see curated resources — videos, articles, and documentation. Track your progress with quiz milestones.",
      },
      {
        label: "AI Tutor",
        title: "Personal AI Tutor",
        description:
          "Stuck on a concept? Chat with the AI tutor for contextual explanations. It understands exactly which topic you're studying.",
      },
      {
        label: "Quiz",
        title: "AI-Generated Quizzes",
        description:
          "Test your understanding with auto-generated quizzes. Timed, multiple choice, and fully adaptive to each topic node.",
      },
    ],
  },

  howItWorks: {
    sectionLabel: "Simple & Powerful",
    sectionTitle: "How it works",
    steps: [
      {
        title: "Describe Your Goal",
        description:
          'Type what you want to learn — "I want to become a backend developer" or "Teach me Go from scratch".',
      },
      {
        title: "Get Your Roadmap",
        description:
          "AI instantly generates a visual, structured learning path as an interactive flowchart with clear milestones.",
      },
      {
        title: "Start Learning",
        description:
          "Follow the roadmap step by step. Click any node for detailed explanations, resources, and AI-powered Q&A.",
      },
    ],
  },

  testimonial: {
    quote1: '"The best way to learn is with a ',
    quoteHighlight: "clear roadmap",
    quote2: ', and a guide who never sleeps."',
    subtitle: "AI Learning Platform",
  },

  faq: {
    sectionLabel: "All About SkillBridge",
    sectionTitle: "Frequently asked questions",
    sectionDescription:
      "Get quick answers to the most common questions about SkillBridge and how it can help your learning journey.",
    items: [
      {
        question: "Is SkillBridge free?",
        answer:
          "Yes! SkillBridge is free to get started. You can generate AI roadmaps, use the visual editor, and track your progress at no cost.",
      },
      {
        question: "What topics can I learn?",
        answer:
          'Anything! From programming languages like Python and Go, to broader goals like "Become a Full-Stack Developer" or "Learn System Design".',
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
    ],
  },

  pricing: {
    sectionLabel: "Simple Pricing",
    sectionTitle: "Start learning for free",
    sectionDescription:
      "We're currently in Beta. Join now to lock in your free access.",
    planName: "Beta User",
    planDescription: "Full access to all features",
    badge: "Limited Time",
    perMonth: "/month",
    features: [
      "Unlimited AI Roadmaps",
      "Unlimited AI Tutor chats",
      "Progress tracking & Analytics",
      "AI Quiz Generation",
      "Community Discord access",
    ],
    cta: "Claim Free Account",
  },

  footer: {
    copyright: "Built for Education & Upskilling.",
    login: "Login",
    signUp: "Sign Up",
  },
};

const id: Translations = {
  nav: {
    features: "Fitur",
    preview: "Pratinjau",
    howItWorks: "Cara Kerja",
    faq: "FAQ",
    login: "Masuk",
    getStarted: "Mulai Sekarang",
  },

  hero: {
    badge: "Baru: Tutoring Berbasis GPT-4o",
    headlinePre: "Bangun ",
    headlineGradient1: "Jalur Belajarmu ",
    headlineGradient2: "dengan AI.",
    subheadline:
      "Ceritakan tujuanmu, dan kami akan membangun perjalanan belajar yang terstruktur dan interaktif khusus untukmu. Lacak progresmu dengan XP, streak, dan tutor AI di sisimu.",
    placeholderPrefix: "cth. Menjadi Senior ",
    startJourney: "Mulai Belajar",
    start: "Mulai",
    typewriterTexts: [
      "React Developer",
      "Go Backend Engineer",
      "Data Scientist",
      "Cloud Architect",
      "iOS Developer",
    ],
  },

  socialProof: {
    title: "Didukung oleh teknologi terdepan di industri",
  },

  comparison: {
    sectionLabel: "Mengapa Kami Membangun Ini",
    sectionTitle: "Cara belajar yang lebih cerdas",
    oldWayTitle: "Cara Lama",
    oldWayItems: [
      "Membuka 20+ tab YouTube untuk mencari mulai dari mana",
      "Membaca dokumentasi yang membingungkan tanpa konteks yang jelas",
      "Terjebak di bug tanpa ada yang bisa dimintai bantuan",
      "Kehilangan motivasi karena tujuan akhir terasa terlalu jauh",
      "Tidak tahu apakah kamu belajar hal yang benar dengan urutan yang benar",
    ],
    newWayTitle: "SkillBridge",
    newWayItems: [
      "Satu roadmap AI yang disesuaikan dengan tujuanmu",
      "Langkah-langkah tersusun dalam urutan yang logis",
      "Ngobrol dengan AI Tutor kapan saja saat kamu buntu",
      "Lacak progres dengan milestone visual dan penghitung streak",
      "Kuis interaktif untuk memvalidasi pemahamanmu",
    ],
  },

  features: {
    sectionLabel: "Semua yang Kamu Butuhkan",
    sectionTitle: "Mengapa pelajar memilih SkillBridge?",
    sectionDescription:
      "Semua alat yang kamu butuhkan untuk membangun jalur belajar yang jelas dengan AI — dalam satu platform yang elegan.",
    items: [
      {
        title: "Roadmap Berbasis AI",
        description:
          "Cukup ceritakan tujuan belajarmu, dan AI akan menghasilkan roadmap langkah demi langkah yang disesuaikan dengan kebutuhanmu.",
      },
      {
        title: "Editor Flowchart Visual",
        description:
          "Kanvas berbasis node yang interaktif, didukung oleh React Flow. Seret, hubungkan, dan atur jalur belajarmu secara visual.",
      },
      {
        title: "Sistem Kuis Pintar",
        description:
          "Uji pengetahuanmu dengan kuis yang dihasilkan AI. Lacak apa yang sudah dikuasai dan apa yang perlu diulang.",
      },
      {
        title: "Asisten Chat AI",
        description:
          "Klik node manapun untuk mempelajari lebih dalam. Ngobrol dengan AI tentang topik spesifik untuk penjelasan detail.",
      },
      {
        title: "Pelacakan Progres",
        description:
          "Pantau streak belajarmu, waktu yang dihabiskan, dan tingkat penyelesaian. Tetap termotivasi dengan indikator progres visual.",
      },
      {
        title: "Mode Gelap",
        description:
          "Nyaman di mata, siang atau malam. Tema gelap yang dirancang dengan indah untuk sesi belajar yang panjang dan nyaman.",
      },
    ],
  },

  preview: {
    sectionLabel: "Lihat Langsung",
    sectionTitle: "Sekilas tentang SkillBridge",
    sectionDescription:
      "Screenshot asli dari aplikasi — jelajahi pengalaman utamanya.",
    tabs: [
      {
        label: "Roadmap AI",
        title: "Roadmap Visual Interaktif",
        description:
          "AI menghasilkan jalur belajar terstruktur dalam bentuk flowchart yang indah. Setiap node mewakili topik, terhubung dalam urutan belajar yang optimal.",
      },
      {
        label: "Sumber Belajar",
        title: "Sumber Belajar yang Kaya",
        description:
          "Klik node manapun untuk melihat sumber belajar terkurasi — video, artikel, dan dokumentasi. Lacak progresmu dengan milestone kuis.",
      },
      {
        label: "Tutor AI",
        title: "Tutor AI Pribadi",
        description:
          "Bingung dengan suatu konsep? Ngobrol dengan tutor AI untuk penjelasan kontekstual. Ia memahami persis topik apa yang sedang kamu pelajari.",
      },
      {
        label: "Kuis",
        title: "Kuis Buatan AI",
        description:
          "Uji pemahamanmu dengan kuis yang dihasilkan otomatis. Dilengkapi timer, pilihan ganda, dan sepenuhnya adaptif untuk setiap node topik.",
      },
    ],
  },

  howItWorks: {
    sectionLabel: "Simpel & Powerful",
    sectionTitle: "Cara kerjanya",
    steps: [
      {
        title: "Ceritakan Tujuanmu",
        description:
          'Ketik apa yang ingin kamu pelajari — "Saya ingin menjadi backend developer" atau "Ajari saya Go dari nol".',
      },
      {
        title: "Dapatkan Roadmap-mu",
        description:
          "AI langsung menghasilkan jalur belajar visual dan terstruktur sebagai flowchart interaktif dengan milestone yang jelas.",
      },
      {
        title: "Mulai Belajar",
        description:
          "Ikuti roadmap langkah demi langkah. Klik node manapun untuk penjelasan detail, sumber belajar, dan tanya jawab dengan AI.",
      },
    ],
  },

  testimonial: {
    quote1: '"Cara terbaik untuk belajar adalah dengan ',
    quoteHighlight: "roadmap yang jelas",
    quote2: ', dan pemandu yang tidak pernah tidur."',
    subtitle: "Platform Belajar AI",
  },

  faq: {
    sectionLabel: "Semua Tentang SkillBridge",
    sectionTitle: "Pertanyaan yang sering diajukan",
    sectionDescription:
      "Dapatkan jawaban cepat untuk pertanyaan paling umum tentang SkillBridge dan bagaimana platform ini bisa membantu perjalanan belajarmu.",
    items: [
      {
        question: "Apakah SkillBridge gratis?",
        answer:
          "Ya! SkillBridge gratis untuk memulai. Kamu bisa membuat roadmap AI, menggunakan editor visual, dan melacak progresmu tanpa biaya.",
      },
      {
        question: "Topik apa saja yang bisa dipelajari?",
        answer:
          'Apa saja! Dari bahasa pemrograman seperti Python dan Go, hingga tujuan yang lebih luas seperti "Menjadi Full-Stack Developer" atau "Belajar System Design".',
      },
      {
        question: "Bagaimana AI menghasilkan roadmap?",
        answer:
          "SkillBridge menggunakan AI canggih (GPT/Gemini) sebagai arsitek kurikulum. AI memecah tujuanmu menjadi langkah-langkah belajar terstruktur dengan urutan yang logis.",
      },
      {
        question: "Bisakah saya mengedit roadmap yang dihasilkan?",
        answer:
          "Tentu saja! Editor flowchart visual memungkinkanmu menyeret, mengatur ulang, menambah, atau menghapus node untuk menyesuaikan roadmap sesuai preferensimu.",
      },
      {
        question: "Apakah data saya tersimpan?",
        answer:
          "Ya. Roadmap dan progresmu disimpan dengan aman. Kamu bisa mengaksesnya kapan saja dari perangkat manapun setelah login.",
      },
      {
        question: "Apakah saya perlu akun?",
        answer:
          "Ya, akun gratis diperlukan untuk menyimpan roadmap dan melacak progres. Kamu bisa mendaftar dengan email, Google, atau GitHub.",
      },
    ],
  },

  pricing: {
    sectionLabel: "Harga Sederhana",
    sectionTitle: "Mulai belajar secara gratis",
    sectionDescription:
      "Kami saat ini dalam tahap Beta. Bergabung sekarang untuk mendapatkan akses gratis.",
    planName: "Pengguna Beta",
    planDescription: "Akses penuh ke semua fitur",
    badge: "Waktu Terbatas",
    perMonth: "/bulan",
    features: [
      "Roadmap AI Tanpa Batas",
      "Chat Tutor AI Tanpa Batas",
      "Pelacakan Progres & Analitik",
      "Kuis Buatan AI",
      "Akses Komunitas Discord",
    ],
    cta: "Klaim Akun Gratis",
  },

  footer: {
    copyright: "Dibangun untuk Edukasi & Peningkatan Skill.",
    login: "Masuk",
    signUp: "Daftar",
  },
};

const translations: Record<Language, Translations> = { en, id };

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export function getStoredLanguage(): Language {
  const stored = typeof window !== "undefined" ? localStorage.getItem("language") : null;
  return (stored === "id" || stored === "en") ? stored : "en";
}
