// In-app UI translations (EN & ID)
// Covers: Sidebar, Settings, Language, Header, NodeDetailPanel, ChatPanel, common actions

export type AppLanguage = "en" | "id";

export interface AppTranslations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    back: string;
    close: string;
    search: string;
    comingSoon: string;
    logOut: string;
    loading: string;
    saving: string;
    copy: string;
    regenerate: string;
    goodResponse: string;
    badResponse: string;
    stop: string;
    send: string;
    ai: string;
  };

  sidebar: {
    newProject: string;
    searchProjects: string;
    yourProjects: string;
    noProjects: string;
    noMatching: string;
    myAccount: string;
    profile: string;
    settings: string;
    billing: string;
    language: string;
    expandSidebar: string;
    collapseSidebar: string;
    closeSidebar: string;
    projectActions: string;
    rename: string;
    renameProject: string;
    renameDescription: string;
    projectName: string;
    deleteProject: string;
    deleteDescription: string;
    openMenu: string;
  };

  settingsPage: {
    title: string;
    appearance: string;
    appearanceDescription: string;
    darkMode: string;
    darkModeDescription: string;
    editor: string;
    editorDescription: string;
    aiPanel: string;
    aiPanelDescription: string;
    notifications: string;
    notificationsDescription: string;
    emailNotifications: string;
    emailNotificationsDescription: string;
    dangerZone: string;
    dangerZoneDescription: string;
    deleteAccount: string;
    deleteAccountDescription: string;
    deleteAccountConfirmTitle: string;
    deleteAccountConfirmDescription: string;
    loggedInAs: string;
    language: string;
    languageDescription: string;
    currentLanguage: string;
    changeLanguage: string;
  };

  languagePage: {
    title: string;
    description: string;
    languageChanged: string;
  };

  languageDialog: {
    title: string;
    description: string;
  };

  toasts: {
    projectCreated: string;
    projectRenamed: string;
    projectDeleted: string;
    loadFailed: string;
    renameFailed: string;
    deleteFailed: string;
    loggedOut: string;
    deleteAccountSoon: string;
    userNotAuth: string;
    roadmapSaved: string;
    roadmapSaveFailed: string;
    noRoadmapToSave: string;
    pleaseLoginFirst: string;
    projectCreatedName: string;
    projectCreateFailed: string;
    roadmapExported: string;
    exportFailed: string;
    noNodesToExport: string;
    settingsComingSoon: string;
  };

  // Header
  header: {
    saveProject: string;
    saveProjectShortcut: string;
    switchTheme: string;
    shareRoadmap: string;
    exportToPng: string;
    clearCanvas: string;
    clearCanvasConfirm: string;
    certificate: string;
    progressDashboard: string;
    mySettings: string;
    generatingImage: string;
    canvasElementNotFound: string;
    pleaseSaveFirst: string;
  };

  // NodeDetailPanel
  nodeDetail: {
    title: string;
    subtitle: string;
    selectNodePrompt: string;
    tabResources: string;
    tabAiTutor: string;
    tabNotes: string;
    statusDone: string;
    statusPending: string;
    freeResources: string;
    videoTutorials: string;
    confusedTitle: string;
    confusedSubtitle: string;
    quizCompleted: string;
    correct: string;
    reviewAnswers: string;
    exportPdf: string;
    downloadPdfTitle: string;
    yourAnswer: string;
    correctAnswer: string;
    quizLocked: string;
    quizLockedDescription: string;
    projectLocked: string;
    projectLockedDescription: string;
    takeQuiz: string;
    saveRoadmapFirst: string;
    completed: string;
    completedOptionalDesc: string;
    optionalTopicDesc: string;
    markAsComplete: string;
    projectCompleted: string;
    projectCompletedDesc: string;
    howToCompleteProject: string;
    projectStep1: string;
    projectStep2: string;
    projectStep3: string;
    projectStep4: string;
    projectTip: string;
    iCompletedProject: string;
    personalNotes: string;
    forceSave: string;
    savingNote: string;
    savedAt: string;
    notePlaceholder: string;
  };

  // ChatPanel
  chat: {
    aiAssistant: string;
    poweredBy: string;
    welcome: string;
    welcomeHint: string;
    setPreferences: string;
    customizePreferences: string;
    skillLevel: string;
    learningStyle: string;
    timeLabel: string;
    goalLabel: string;
    casual: string;
    moderate: string;
    intensive: string;
    career: string;
    project: string;
    certification: string;
    hobby: string;
    startWithTopic: string;
    suggestion1: string;
    suggestion2: string;
    suggestion3: string;
    askAnything: string;
    thinking: string;
    stopGenerating: string;
    roadmapCreated: string;
    roadmapCreatedBody: string;
    askAboutRoadmap: string;
    errorNoConnection: string;
    errorNoConnectionDesc: string;
    errorRateLimit: string;
    errorRateLimitDesc: string;
    errorUnavailable: string;
    errorUnavailableDesc: string;
    errorGeneric: string;
    errorGenericDesc: string;
    contextualPrompt: string;
  };

  // TemplateSelector
  templateSelector: {
    startJourney: string;
    description: string;
    all: string;
    topics: string;
    askAi: string;
  };

  // FullScreenChat (AI Tutor)
  fullScreenChat: {
    welcomeMessage: string;
    suggestedQ1: string;
    suggestedQ2: string;
    suggestedQ3: string;
    suggestedQ4: string;
    suggestedQ5: string;
    suggestedQ6: string;
    chatLoadingHistory: string;
    typing: string;
    trySuggestions: string;
    resources: string;
    quickQuestions: string;
    clear: string;
    minimize: string;
    done: string;
    you: string;
    askPlaceholder: string;
    enterSend: string;
    shiftEnterNewline: string;
    chatCleared: string;
    failedResponse: string;
  };

  // NodeChatPanel (mini AI Tutor in detail panel)
  nodeChatPanel: {
    notSaved: string;
    notSavedDesc: string;
    askAiAbout: string;
    getExplanation: string;
    trySuggestions: string;
  };

  // BillingPage
  billing: {
    title: string;
    currentPlan: string;
    activeSubscription: string;
    projects: string;
    quizzesPassed: string;
    totalXp: string;
    level: string;
    betaTitle: string;
    betaDescription: string;
    availablePlans: string;
    mostPopular: string;
    currentPlanBtn: string;
    contactSales: string;
    upgrade: string;
    faqTitle: string;
    faq1Question: string;
    faq1Answer: string;
    faq2Question: string;
    faq2Answer: string;
    faq3Question: string;
    faq3Answer: string;
    toastEnterprise: string;
    toastPaymentSoon: string;
    // Plan details
    freeName: string;
    freePrice: string;
    freePeriod: string;
    freeDescription: string;
    freeFeature1: string;
    freeFeature2: string;
    freeFeature3: string;
    freeFeature4: string;
    proName: string;
    proPrice: string;
    proPeriod: string;
    proDescription: string;
    proFeature1: string;
    proFeature2: string;
    proFeature3: string;
    proFeature4: string;
    proFeature5: string;
    proFeature6: string;
    enterpriseName: string;
    enterprisePrice: string;
    enterpriseDescription: string;
    enterpriseFeature1: string;
    enterpriseFeature2: string;
    enterpriseFeature3: string;
    enterpriseFeature4: string;
    enterpriseFeature5: string;
    enterpriseFeature6: string;
  };
}

const en: AppTranslations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    back: "Back",
    close: "Close",
    search: "Search",
    comingSoon: "Coming soon",
    logOut: "Log out",
    loading: "Loading...",
    saving: "Saving...",
    copy: "Copy",
    regenerate: "Regenerate",
    goodResponse: "Good response",
    badResponse: "Bad response",
    stop: "Stop",
    send: "Send",
    ai: "AI",
  },

  sidebar: {
    newProject: "New Project",
    searchProjects: "Search projects...",
    yourProjects: "Your Projects",
    noProjects: "No projects yet",
    noMatching: "No matching projects",
    myAccount: "My Account",
    profile: "Profile",
    settings: "Settings",
    billing: "Billing",
    language: "Language",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    closeSidebar: "Close sidebar",
    projectActions: "Project actions",
    rename: "Rename",
    renameProject: "Rename Project",
    renameDescription: "Enter a new name for your project.",
    projectName: "Project name",
    deleteProject: "Delete Project",
    deleteDescription:
      'Are you sure you want to delete "{title}"? This action cannot be undone. All roadmaps in this project will also be deleted.',
    openMenu: "Open menu",
  },

  settingsPage: {
    title: "Settings",
    appearance: "Appearance",
    appearanceDescription: "Customize how SkillBridge looks on your device",
    darkMode: "Dark Mode",
    darkModeDescription: "Toggle between light and dark theme",
    editor: "Editor",
    editorDescription: "Configure the roadmap editor behavior",
    aiPanel: "AI Panel",
    aiPanelDescription: "Show AI assistant panel by default",
    notifications: "Notifications",
    notificationsDescription: "Manage your notification preferences",
    emailNotifications: "Email Notifications",
    emailNotificationsDescription: "Receive updates about your learning progress",
    dangerZone: "Danger Zone",
    dangerZoneDescription: "Irreversible actions for your account",
    deleteAccount: "Delete Account",
    deleteAccountDescription: "Permanently delete your account and all data",
    deleteAccountConfirmTitle: "Are you absolutely sure?",
    deleteAccountConfirmDescription:
      "This action cannot be undone. This will permanently delete your account and remove all your data including projects, roadmaps, and quiz results.",
    loggedInAs: "Logged in as",
    language: "Language",
    languageDescription: "Choose your preferred display language",
    currentLanguage: "Current language",
    changeLanguage: "Change",
  },

  languagePage: {
    title: "Language / Bahasa",
    description: "Choose your preferred display language",
    languageChanged: "Language changed to {name}",
  },

  languageDialog: {
    title: "Language / Bahasa",
    description: "Choose your preferred display language",
  },

  toasts: {
    projectCreated: "Project created successfully",
    projectRenamed: "Project renamed successfully",
    projectDeleted: "Project deleted successfully",
    loadFailed: "Failed to load projects",
    renameFailed: "Failed to rename project",
    deleteFailed: "Failed to delete project",
    loggedOut: "Logged out successfully",
    deleteAccountSoon: "Delete account feature coming soon",
    userNotAuth: "User not authenticated",
    roadmapSaved: "Roadmap saved successfully!",
    roadmapSaveFailed: "Failed to save roadmap",
    noRoadmapToSave: "No roadmap to save",
    pleaseLoginFirst: "Please log in first",
    projectCreatedName: 'Project "{title}" created!',
    projectCreateFailed: "Failed to create project",
    roadmapExported: "Roadmap exported successfully!",
    exportFailed: "Failed to export roadmap",
    noNodesToExport: "No nodes to export",
    settingsComingSoon: "Settings are coming soon!",
  },

  header: {
    saveProject: "Save",
    saveProjectShortcut: "Save Project (Ctrl+S)",
    switchTheme: "Switch Theme",
    shareRoadmap: "Share Roadmap",
    exportToPng: "Export to PNG",
    clearCanvas: "Clear Canvas",
    clearCanvasConfirm: "Are you sure you want to clear the canvas? This action cannot be undone.",
    certificate: "Certificate",
    progressDashboard: "Progress Dashboard",
    mySettings: "My Settings",
    generatingImage: "Generating image...",
    canvasElementNotFound: "Could not find canvas element",
    pleaseSaveFirst: "Please save your roadmap first",
  },

  nodeDetail: {
    title: "Node Details",
    subtitle: "Resources & AI Tutor",
    selectNodePrompt: "Select a node to view its details",
    tabResources: "Resources",
    tabAiTutor: "AI Tutor",
    tabNotes: "Notes",
    statusDone: "Done",
    statusPending: "Pending",
    freeResources: "Free Resources",
    videoTutorials: "Video Tutorials",
    confusedTitle: "Confused about this material?",
    confusedSubtitle: "Ask AI Tutor now",
    quizCompleted: "Quiz Completed! ✅",
    correct: "correct",
    reviewAnswers: "Review Answers",
    exportPdf: "Export PDF",
    downloadPdfTitle: "Download Quiz Result as PDF",
    yourAnswer: "Your answer:",
    correctAnswer: "Correct answer:",
    quizLocked: "Quiz Locked",
    quizLockedDescription: "Complete the following prerequisites to unlock the Quiz",
    projectLocked: "Project Locked",
    projectLockedDescription: "Complete the following prerequisites to unlock the Project",
    takeQuiz: "Take Quiz to Complete This Topic",
    saveRoadmapFirst: "Save your roadmap first (Ctrl+S) to take the quiz",
    completed: "Completed!",
    completedOptionalDesc: "You've explored this optional topic.",
    optionalTopicDesc: "This is an optional topic. No quiz required - explore at your own pace!",
    markAsComplete: "Mark as Complete",
    projectCompleted: "Project Completed!",
    projectCompletedDesc: "Great job finishing this project.",
    howToCompleteProject: "🚀 How to Complete This Project:",
    projectStep1: "Study all the resources available above",
    projectStep2: 'Create a project based on the topic "{label}"',
    projectStep3: "Implement the concepts you've learned",
    projectStep4: "Once done, click the button below to mark as complete",
    projectTip: "💡 Tip: Use AI Tutor if you need help with this project!",
    iCompletedProject: "I Have Completed This Project",
    personalNotes: "Personal Notes",
    forceSave: "Force Save",
    savingNote: "Saving...",
    savedAt: "Saved",
    notePlaceholder: "Write your personal notes for this topic here... (Auto-saves while typing)",
  },

  chat: {
    aiAssistant: "AI Assistant",
    poweredBy: "Powered by SkillBridge",
    welcome: "Welcome to SkillBridge!",
    welcomeHint: "I can help you build learning roadmaps. Try asking:",
    setPreferences: "Set Learning Preferences",
    customizePreferences: "Customize your level & learning style",
    skillLevel: "Skill Level",
    learningStyle: "Learning Style",
    timeLabel: "Time",
    goalLabel: "Goal",
    casual: "Casual (~1 hr/day)",
    moderate: "Moderate (2-3 hrs/day)",
    intensive: "Intensive (4+ hrs/day)",
    career: "Career",
    project: "Project",
    certification: "Certification",
    hobby: "Hobby",
    startWithTopic: "Start with a topic below:",
    suggestion1: "Create a React Developer roadmap",
    suggestion2: "Explain System Design concepts",
    suggestion3: "How to learn Go?",
    askAnything: "Ask AI anything...",
    thinking: "Thinking...",
    stopGenerating: "Stop generating",
    roadmapCreated: '🎉 Roadmap "{title}" created!',
    roadmapCreatedBody: "This roadmap has {count} learning steps. Click on each node to view details and learning resources.",
    askAboutRoadmap: "Do you have any questions about this roadmap?",
    errorNoConnection: "🔌 **Cannot connect to server**",
    errorNoConnectionDesc: "Possible causes:\n- Backend server is not running\n- Internet connection lost\n\nPlease try again shortly.",
    errorRateLimit: "⏳ **Server is busy**",
    errorRateLimitDesc: "Too many requests in a short time. Please wait a few seconds and try again.",
    errorUnavailable: "🔧 **AI service is unavailable**",
    errorUnavailableDesc: "Please try again in a few minutes.",
    errorGeneric: "❌ **An error occurred**",
    errorGenericDesc: "Unable to process the request. Please try again.",
    contextualPrompt: 'Explain more about "{topic}" in the context of a learning roadmap. What are the key things to learn and how to get started?',
  },

  templateSelector: {
    startJourney: "Start Your Learning Journey",
    description: "Choose a curated template or ask AI to construct a highly personalized roadmap just for you.",
    all: "All",
    topics: "topics",
    askAi: "Ask AI to Create Custom Roadmap",
  },

  fullScreenChat: {
    welcomeMessage: `Hi! 👋 I'm your AI Tutor for the topic **{topic}**.\n\n{description}I'm ready to help you understand this material. You can:\n- Ask me anything about this topic\n- Request code examples or explanations\n- Discuss concepts you haven't understood\n\nWhere would you like to start? 😊`,
    suggestedQ1: "What is {topic}?",
    suggestedQ2: "How to start learning {topic}?",
    suggestedQ3: "Give me code examples for {topic}",
    suggestedQ4: "Beginner mistakes when learning {topic}?",
    suggestedQ5: "Best practices for {topic}?",
    suggestedQ6: "What's next after {topic}?",
    chatLoadingHistory: "Loading chat history...",
    typing: "Typing...",
    trySuggestions: "Try asking",
    resources: "Resources",
    quickQuestions: "Quick Questions",
    clear: "Clear",
    minimize: "Minimize",
    done: "Done",
    you: "You",
    askPlaceholder: "Ask about {topic}...",
    enterSend: "send",
    shiftEnterNewline: "new line",
    chatCleared: "Chat history cleared",
    failedResponse: "Failed to get AI response",
  },

  nodeChatPanel: {
    notSaved: "Roadmap Not Saved",
    notSavedDesc: "Save your roadmap first (Ctrl+S) to use the AI Tutor.",
    askAiAbout: "Ask AI about",
    getExplanation: "Get personalized explanations, code examples, and specific guidance.",
    trySuggestions: "Try asking:",
  },

  billing: {
    title: "Billing",
    currentPlan: "Current Plan",
    activeSubscription: "Your active subscription",
    projects: "Projects",
    quizzesPassed: "Quizzes Passed",
    totalXp: "Total XP",
    level: "Level",
    betaTitle: "🚧 Feature In Development",
    betaDescription: "The payment system and plan upgrades are not yet available. Currently, all users can access Pro features for free during the beta period.",
    availablePlans: "Available Plans",
    mostPopular: "Most Popular",
    currentPlanBtn: "Current Plan",
    contactSales: "Contact Sales",
    upgrade: "Upgrade",
    faqTitle: "Frequently Asked Questions",
    faq1Question: "How do I upgrade to Pro?",
    faq1Answer: "The payment feature will be available soon. Currently, all Pro features can be accessed for free during the beta period.",
    faq2Question: "Is there a trial for Pro?",
    faq2Answer: "Yes! During the beta period, all users get access to Pro features for free.",
    faq3Question: "What about Enterprise?",
    faq3Answer: "Contact our team at support@skillbridge.id to discuss your team or organization's needs.",
    toastEnterprise: "Contact us at support@skillbridge.id for the Enterprise plan",
    toastPaymentSoon: "The payment feature will be available soon!",
    freeName: "Free",
    freePrice: "$0",
    freePeriod: "forever",
    freeDescription: "Perfect for getting started",
    freeFeature1: "Up to 3 projects",
    freeFeature2: "Basic AI roadmap generation",
    freeFeature3: "Quiz system",
    freeFeature4: "Community support",
    proName: "Pro",
    proPrice: "$9.99",
    proPeriod: "/month",
    proDescription: "For serious learners",
    proFeature1: "Unlimited projects",
    proFeature2: "Priority AI generation",
    proFeature3: "Advanced analytics",
    proFeature4: "Export to PDF",
    proFeature5: "Email support",
    proFeature6: "No ads",
    enterpriseName: "Enterprise",
    enterprisePrice: "Custom",
    enterpriseDescription: "For teams & organizations",
    enterpriseFeature1: "Everything in Pro",
    enterpriseFeature2: "Team collaboration",
    enterpriseFeature3: "Custom integrations",
    enterpriseFeature4: "SSO authentication",
    enterpriseFeature5: "Dedicated support",
    enterpriseFeature6: "Custom branding",
  },
};

const id: AppTranslations = {
  common: {
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    back: "Kembali",
    close: "Tutup",
    search: "Cari",
    comingSoon: "Segera hadir",
    logOut: "Keluar",
    loading: "Memuat...",
    saving: "Menyimpan...",
    copy: "Salin",
    regenerate: "Buat Ulang",
    goodResponse: "Respons bagus",
    badResponse: "Respons buruk",
    stop: "Hentikan",
    send: "Kirim",
    ai: "AI",
  },

  sidebar: {
    newProject: "Proyek Baru",
    searchProjects: "Cari proyek...",
    yourProjects: "Proyek Kamu",
    noProjects: "Belum ada proyek",
    noMatching: "Tidak ada proyek yang cocok",
    myAccount: "Akun Saya",
    profile: "Profil",
    settings: "Pengaturan",
    billing: "Tagihan",
    language: "Bahasa",
    expandSidebar: "Perluas sidebar",
    collapseSidebar: "Kecilkan sidebar",
    closeSidebar: "Tutup sidebar",
    projectActions: "Aksi proyek",
    rename: "Ubah Nama",
    renameProject: "Ubah Nama Proyek",
    renameDescription: "Masukkan nama baru untuk proyekmu.",
    projectName: "Nama proyek",
    deleteProject: "Hapus Proyek",
    deleteDescription:
      'Apakah kamu yakin ingin menghapus "{title}"? Tindakan ini tidak bisa dibatalkan. Semua roadmap dalam proyek ini juga akan dihapus.',
    openMenu: "Buka menu",
  },

  settingsPage: {
    title: "Pengaturan",
    appearance: "Tampilan",
    appearanceDescription: "Sesuaikan tampilan SkillBridge di perangkatmu",
    darkMode: "Mode Gelap",
    darkModeDescription: "Beralih antara tema terang dan gelap",
    editor: "Editor",
    editorDescription: "Konfigurasi perilaku editor roadmap",
    aiPanel: "Panel AI",
    aiPanelDescription: "Tampilkan panel asisten AI secara default",
    notifications: "Notifikasi",
    notificationsDescription: "Kelola preferensi notifikasimu",
    emailNotifications: "Notifikasi Email",
    emailNotificationsDescription: "Terima pembaruan tentang progres belajarmu",
    dangerZone: "Zona Berbahaya",
    dangerZoneDescription: "Tindakan yang tidak bisa dikembalikan untuk akunmu",
    deleteAccount: "Hapus Akun",
    deleteAccountDescription: "Hapus akun dan semua data secara permanen",
    deleteAccountConfirmTitle: "Apakah kamu benar-benar yakin?",
    deleteAccountConfirmDescription:
      "Tindakan ini tidak bisa dibatalkan. Ini akan menghapus akunmu secara permanen dan menghapus semua data termasuk proyek, roadmap, dan hasil kuis.",
    loggedInAs: "Masuk sebagai",
    language: "Bahasa",
    languageDescription: "Pilih bahasa tampilan yang kamu inginkan",
    currentLanguage: "Bahasa saat ini",
    changeLanguage: "Ubah",
  },

  languagePage: {
    title: "Language / Bahasa",
    description: "Pilih bahasa tampilan yang kamu inginkan",
    languageChanged: "Bahasa diubah ke {name}",
  },

  languageDialog: {
    title: "Language / Bahasa",
    description: "Pilih bahasa tampilan yang kamu inginkan",
  },

  toasts: {
    projectCreated: "Proyek berhasil dibuat",
    projectRenamed: "Proyek berhasil diubah nama",
    projectDeleted: "Proyek berhasil dihapus",
    loadFailed: "Gagal memuat proyek",
    renameFailed: "Gagal mengubah nama proyek",
    deleteFailed: "Gagal menghapus proyek",
    loggedOut: "Berhasil keluar",
    deleteAccountSoon: "Fitur hapus akun akan segera tersedia",
    userNotAuth: "Pengguna tidak terautentikasi",
    roadmapSaved: "Roadmap berhasil disimpan!",
    roadmapSaveFailed: "Gagal menyimpan roadmap",
    noRoadmapToSave: "Tidak ada roadmap untuk disimpan",
    pleaseLoginFirst: "Silakan login terlebih dahulu",
    projectCreatedName: 'Proyek "{title}" berhasil dibuat!',
    projectCreateFailed: "Gagal membuat proyek",
    roadmapExported: "Roadmap berhasil diekspor!",
    exportFailed: "Gagal mengekspor roadmap",
    noNodesToExport: "Tidak ada node untuk diekspor",
    settingsComingSoon: "Pengaturan akan segera tersedia!",
  },

  header: {
    saveProject: "Simpan",
    saveProjectShortcut: "Simpan Proyek (Ctrl+S)",
    switchTheme: "Ganti Tema",
    shareRoadmap: "Bagikan Roadmap",
    exportToPng: "Ekspor ke PNG",
    clearCanvas: "Bersihkan Kanvas",
    clearCanvasConfirm: "Apakah kamu yakin ingin membersihkan kanvas? Tindakan ini tidak bisa dibatalkan.",
    certificate: "Sertifikat",
    progressDashboard: "Dasbor Progres",
    mySettings: "Pengaturan Saya",
    generatingImage: "Membuat gambar...",
    canvasElementNotFound: "Elemen kanvas tidak ditemukan",
    pleaseSaveFirst: "Simpan roadmap terlebih dahulu",
  },

  nodeDetail: {
    title: "Detail Node",
    subtitle: "Sumber Belajar & AI Tutor",
    selectNodePrompt: "Pilih node untuk melihat detailnya",
    tabResources: "Sumber",
    tabAiTutor: "AI Tutor",
    tabNotes: "Catatan",
    statusDone: "Selesai",
    statusPending: "Belum Selesai",
    freeResources: "Sumber Gratis",
    videoTutorials: "Video Tutorial",
    confusedTitle: "Bingung dengan materi ini?",
    confusedSubtitle: "Tanya AI Tutor sekarang",
    quizCompleted: "Quiz Selesai! ✅",
    correct: "benar",
    reviewAnswers: "Review Jawaban",
    exportPdf: "Ekspor PDF",
    downloadPdfTitle: "Unduh Hasil Quiz sebagai PDF",
    yourAnswer: "Jawabanmu:",
    correctAnswer: "Jawaban benar:",
    quizLocked: "Quiz Terkunci",
    quizLockedDescription: "Selesaikan prasyarat berikut untuk membuka Quiz",
    projectLocked: "Project Terkunci",
    projectLockedDescription: "Selesaikan prasyarat berikut untuk membuka Project",
    takeQuiz: "Ambil Quiz untuk Menyelesaikan Topik Ini",
    saveRoadmapFirst: "Simpan roadmap terlebih dahulu (Ctrl+S) untuk mengerjakan quiz",
    completed: "Selesai!",
    completedOptionalDesc: "Kamu telah mempelajari topik opsional ini.",
    optionalTopicDesc: "Ini adalah topik opsional. Tidak perlu quiz - pelajari sesuai tempo kamu!",
    markAsComplete: "Tandai Selesai",
    projectCompleted: "Project Selesai!",
    projectCompletedDesc: "Kerja bagus menyelesaikan project ini.",
    howToCompleteProject: "🚀 Cara Menyelesaikan Project Ini:",
    projectStep1: "Pelajari semua resources yang tersedia di atas",
    projectStep2: 'Buat project sesuai dengan topik "{label}"',
    projectStep3: "Implementasikan konsep yang sudah dipelajari",
    projectStep4: "Setelah selesai, klik tombol di bawah untuk menandai selesai",
    projectTip: "💡 Tips: Gunakan AI Tutor jika butuh bantuan dalam mengerjakan project ini!",
    iCompletedProject: "Saya Sudah Menyelesaikan Project Ini",
    personalNotes: "Catatan Pribadi",
    forceSave: "Paksa Simpan",
    savingNote: "Menyimpan...",
    savedAt: "Tersimpan",
    notePlaceholder: "Tulis catatan pribadimu untuk topik ini di sini... (Otomatis tersimpan saat mengetik)",
  },

  chat: {
    aiAssistant: "Asisten AI",
    poweredBy: "Didukung oleh SkillBridge",
    welcome: "Selamat datang di SkillBridge!",
    welcomeHint: "Saya bisa membantu membuat roadmap belajar. Coba tanyakan:",
    setPreferences: "Atur Preferensi Belajar",
    customizePreferences: "Sesuaikan level & gaya belajarmu",
    skillLevel: "Level Belajar",
    learningStyle: "Gaya Belajar",
    timeLabel: "Waktu",
    goalLabel: "Tujuan",
    casual: "Santai (~1 jam/hari)",
    moderate: "Sedang (2-3 jam/hari)",
    intensive: "Intensif (4+ jam/hari)",
    career: "Karier",
    project: "Project",
    certification: "Sertifikasi",
    hobby: "Hobi",
    startWithTopic: "Mulai dengan topik di bawah:",
    suggestion1: "Buatkan roadmap React Developer",
    suggestion2: "Jelaskan konsep System Design",
    suggestion3: "Bagaimana cara belajar Go?",
    askAnything: "Tanya AI apa saja...",
    thinking: "Berpikir...",
    stopGenerating: "Hentikan generasi",
    roadmapCreated: '🎉 Roadmap "{title}" berhasil dibuat!',
    roadmapCreatedBody: "Roadmap ini memiliki {count} langkah pembelajaran. Klik pada setiap node untuk melihat detail dan sumber belajar.",
    askAboutRoadmap: "Ada yang ingin kamu tanyakan tentang roadmap ini?",
    errorNoConnection: "🔌 **Tidak dapat terhubung ke server**",
    errorNoConnectionDesc: "Kemungkinan penyebab:\n- Server backend belum dijalankan\n- Koneksi internet terputus\n\nSilakan coba lagi dalam beberapa saat.",
    errorRateLimit: "⏳ **Server sedang sibuk**",
    errorRateLimitDesc: "Terlalu banyak permintaan dalam waktu singkat. Silakan tunggu beberapa detik dan coba lagi.",
    errorUnavailable: "🔧 **Layanan AI sedang tidak tersedia**",
    errorUnavailableDesc: "Silakan coba lagi dalam beberapa menit.",
    errorGeneric: "❌ **Terjadi kesalahan**",
    errorGenericDesc: "Tidak dapat memproses permintaan. Silakan coba lagi.",
    contextualPrompt: 'Jelaskan lebih detail tentang "{topic}" dalam konteks roadmap pembelajaran. Apa saja yang perlu dipelajari dan bagaimana cara memulainya?',
  },

  templateSelector: {
    startJourney: "Mulai Perjalanan Belajarmu",
    description: "Pilih template kurasi kami atau minta AI untuk membuat roadmap khusus untukmu.",
    all: "Semua",
    topics: "topik",
    askAi: "Minta AI Buatkan Roadmap Kustom",
  },

  fullScreenChat: {
    welcomeMessage: `Hai! 👋 Aku AI Tutor-mu untuk topik **{topic}**.\n\n{description}Aku siap membantu kamu memahami materi ini. Kamu bisa:\n- Bertanya apa saja tentang topik ini\n- Minta contoh kode atau penjelasan\n- Diskusi tentang konsep yang belum dipahami\n\nMau mulai dari mana? 😊`,
    suggestedQ1: "Apa itu {topic}?",
    suggestedQ2: "Gimana cara mulai belajar {topic}?",
    suggestedQ3: "Berikan contoh kode untuk {topic}",
    suggestedQ4: "Kesalahan pemula saat belajar {topic}?",
    suggestedQ5: "Best practices untuk {topic}?",
    suggestedQ6: "Topik selanjutnya setelah {topic}?",
    chatLoadingHistory: "Memuat riwayat chat...",
    typing: "Sedang mengetik...",
    trySuggestions: "Coba tanyakan",
    resources: "Sumber",
    quickQuestions: "Pertanyaan Cepat",
    clear: "Hapus",
    minimize: "Kecilkan",
    done: "Selesai",
    you: "Kamu",
    askPlaceholder: "Tanya tentang {topic}...",
    enterSend: "kirim",
    shiftEnterNewline: "baris baru",
    chatCleared: "Riwayat percakapan dibersihkan",
    failedResponse: "Gagal mendapatkan respons AI",
  },

  nodeChatPanel: {
    notSaved: "Roadmap Belum Disimpan",
    notSavedDesc: "Simpan roadmap terlebih dahulu (Ctrl+S) untuk menggunakan AI Tutor.",
    askAiAbout: "Tanya AI tentang",
    getExplanation: "Dapatkan penjelasan terpersonalisasi, contoh kode, dan panduan spesifik.",
    trySuggestions: "Coba tanyakan:",
  },

  billing: {
    title: "Tagihan",
    currentPlan: "Paket Saat Ini",
    activeSubscription: "Langganan aktif Anda",
    projects: "Proyek",
    quizzesPassed: "Quiz Lulus",
    totalXp: "Total XP",
    level: "Level",
    betaTitle: "🚧 Fitur Dalam Pengembangan",
    betaDescription: "Sistem pembayaran dan upgrade plan belum tersedia. Saat ini semua pengguna dapat mengakses fitur Pro secara gratis selama masa beta.",
    availablePlans: "Paket Tersedia",
    mostPopular: "Paling Populer",
    currentPlanBtn: "Paket Saat Ini",
    contactSales: "Hubungi Sales",
    upgrade: "Upgrade",
    faqTitle: "Pertanyaan yang Sering Diajukan",
    faq1Question: "Bagaimana cara upgrade ke Pro?",
    faq1Answer: "Fitur pembayaran akan segera tersedia. Saat ini semua fitur Pro dapat diakses secara gratis selama masa beta.",
    faq2Question: "Apakah ada trial untuk Pro?",
    faq2Answer: "Ya! Selama masa beta, semua pengguna mendapatkan akses ke fitur Pro secara gratis.",
    faq3Question: "Bagaimana dengan Enterprise?",
    faq3Answer: "Hubungi tim kami di support@skillbridge.id untuk mendiskusikan kebutuhan tim atau organisasi Anda.",
    toastEnterprise: "Hubungi kami di support@skillbridge.id untuk paket Enterprise",
    toastPaymentSoon: "Fitur pembayaran akan segera tersedia!",
    freeName: "Free",
    freePrice: "Rp 0",
    freePeriod: "selamanya",
    freeDescription: "Cocok untuk memulai",
    freeFeature1: "Hingga 3 proyek",
    freeFeature2: "Generasi roadmap AI dasar",
    freeFeature3: "Sistem quiz",
    freeFeature4: "Dukungan komunitas",
    proName: "Pro",
    proPrice: "Rp 99.000",
    proPeriod: "/bulan",
    proDescription: "Untuk pelajar serius",
    proFeature1: "Proyek tanpa batas",
    proFeature2: "Prioritas generasi AI",
    proFeature3: "Analitik lanjutan",
    proFeature4: "Ekspor ke PDF",
    proFeature5: "Dukungan email",
    proFeature6: "Tanpa iklan",
    enterpriseName: "Enterprise",
    enterprisePrice: "Kustom",
    enterpriseDescription: "Untuk tim & organisasi",
    enterpriseFeature1: "Semua fitur Pro",
    enterpriseFeature2: "Kolaborasi tim",
    enterpriseFeature3: "Integrasi kustom",
    enterpriseFeature4: "Autentikasi SSO",
    enterpriseFeature5: "Dukungan khusus",
    enterpriseFeature6: "Branding kustom",
  },
};

const appTranslations: Record<AppLanguage, AppTranslations> = { en, id };

export function getAppTranslations(lang: AppLanguage): AppTranslations {
  return appTranslations[lang] || appTranslations.en;
}
