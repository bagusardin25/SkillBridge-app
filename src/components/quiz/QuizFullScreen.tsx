import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { generateQuiz, getCachedQuiz, submitQuiz, addXp, type QuizQuestion } from "@/lib/api";
import { QuizQuestionCard } from "./QuizQuestion";
import {
  Loader2,
  Trophy,
  RefreshCw,
  XCircle,
  X,
  Undo2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Zap,
  Target,
  Star,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { cn } from "@/lib/utils";

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Simple confetti effect using CSS
function ConfettiEffect() {
  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            backgroundColor: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 2 + 2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
      `}</style>
    </div>
  );
}

// Circular timer component
function CircularTimer({ remaining, total, isWarning }: { remaining: number; total: number; isWarning: boolean }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative">
      <svg width="56" height="56" className="-rotate-90">
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted/30"
        />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(
            "transition-all duration-1000",
            isWarning ? "text-red-500" : "text-primary"
          )}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-[11px] font-mono font-bold tabular-nums",
          isWarning ? "text-red-500 animate-pulse" : "text-foreground"
        )}>
          {formatTime(remaining)}
        </span>
      </div>
    </div>
  );
}

interface QuizFullScreenProps {
  topic: string;
  description?: string;
  resources?: string[];
  nodeId: string;
  onComplete: () => void;
  onClose: () => void;
}

type QuizState = "loading" | "ready" | "submitting" | "completed" | "failed" | "error" | "timeout";

const PASSING_PERCENTAGE = 80;
const QUIZ_TIME_LIMIT = 300; // 5 minutes in seconds
const WARNING_TIME = 60; // Show warning when 1 minute left

export function QuizFullScreen({
  topic,
  description,
  resources = [],
  nodeId,
  onComplete,
  onClose
}: QuizFullScreenProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [answerHistory, setAnswerHistory] = useState<{ index: number, value: number | null }[]>([]);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number; timeTaken?: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Timer state - countdown from 5 minutes
  const [remainingTime, setRemainingTime] = useState(QUIZ_TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoSubmitted = useRef(false);

  const { user } = useAuthStore();
  const { currentRoadmapId } = useRoadmapStore();

  // Load quiz function
  const loadQuiz = async () => {
    setQuizState("loading");
    setError(null);
    setCurrentIndex(0);
    setAnswers([]);
    setAnswerHistory([]);
    setResult(null);
    setShowConfetti(false);

    // Reset timer to 5 minutes
    setRemainingTime(QUIZ_TIME_LIMIT);
    hasAutoSubmitted.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      // Check for cached quiz in database
      if (user?.id && currentRoadmapId) {
        const cachedQuiz = await getCachedQuiz(currentRoadmapId, nodeId, user.id);
        if (cachedQuiz) {
          setQuestions(cachedQuiz.questions);
          setAnswers(new Array(cachedQuiz.questions.length).fill(null));
          setQuizState("ready");
          return;
        }
      }

      // Generate new quiz — pass resources for context-aware questions
      const response = await generateQuiz(topic, description, resources);
      setQuestions(response.questions);
      setAnswers(new Array(response.questions.length).fill(null));
      setQuizState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
      setQuizState("error");
    }
  };

  // Timer effect - countdown
  useEffect(() => {
    if (quizState === "ready" && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }

    if (quizState === "completed" || quizState === "failed" || quizState === "error" || quizState === "timeout") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (remainingTime === 0 && quizState === "ready" && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleAutoSubmit();
    }
  }, [remainingTime, quizState]);

  // Load quiz on mount
  useEffect(() => {
    loadQuiz();
  }, [topic]);

  const handleAnswer = (answerIndex: number) => {
    setAnswerHistory(prev => [...prev, { index: currentIndex, value: answers[currentIndex] }]);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleUndo = () => {
    if (answerHistory.length === 0) return;
    const lastAction = answerHistory[answerHistory.length - 1];
    const newAnswers = [...answers];
    newAnswers[lastAction.index] = lastAction.value;
    setAnswers(newAnswers);
    setCurrentIndex(lastAction.index);
    setAnswerHistory(prev => prev.slice(0, -1));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const handleSubmit = async () => {
    if (!user?.id) { setError("Please login to submit quiz"); setQuizState("error"); return; }
    if (!currentRoadmapId) { setError("Simpan roadmap terlebih dahulu (Ctrl+S)"); setQuizState("error"); return; }
    if (answers.some(a => a === null)) { setError("Please answer all questions before submitting"); return; }

    const timeTaken = QUIZ_TIME_LIMIT - remainingTime;
    setQuizState("submitting");

    try {
      const submitResult = await submitQuiz({
        roadmapId: currentRoadmapId, nodeId, userId: user.id,
        answers: answers as number[], questions, timeTaken,
      });

      setResult({
        score: submitResult.score, total: submitResult.totalQuestions,
        percentage: submitResult.percentage, timeTaken,
      });

      if (submitResult.passed) {
        setQuizState("completed");
        setShowConfetti(true);
        try { await addXp(user.id, 100); } catch (e) { console.error("Failed to add XP:", e); }
        setTimeout(() => setShowConfetti(false), 4000);
        onComplete();
      } else {
        setQuizState("failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      setQuizState("error");
    }
  };

  const handleAutoSubmit = async () => {
    if (!user?.id || !currentRoadmapId) { setQuizState("timeout"); return; }
    const finalAnswers = answers.map(a => a === null ? -1 : a);
    const timeTaken = QUIZ_TIME_LIMIT;
    setQuizState("submitting");

    try {
      const submitResult = await submitQuiz({
        roadmapId: currentRoadmapId, nodeId, userId: user.id,
        answers: finalAnswers, questions, timeTaken,
      });
      setResult({ score: submitResult.score, total: submitResult.totalQuestions, percentage: submitResult.percentage, timeTaken });
      if (submitResult.passed) {
        setQuizState("completed"); setShowConfetti(true);
        try { await addXp(user.id, 100); } catch (e) { console.error("XP error:", e); }
        setTimeout(() => setShowConfetti(false), 4000);
        onComplete();
      } else {
        setQuizState("timeout");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      setQuizState("error");
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setAnswerHistory([]);
    setRemainingTime(QUIZ_TIME_LIMIT);
    hasAutoSubmitted.current = false;
    setQuizState("ready");
    setResult(null);
  };

  // ──── Loading State ────
  if (quizState === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 animate-bounce">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-violet-500/20 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        <div className="mt-8 text-center space-y-2">
          <p className="text-lg font-semibold">Menyiapkan Quiz</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Membuat pertanyaan berdasarkan materi <span className="text-violet-500 font-medium">{topic}</span>...
          </p>
        </div>
        {/* Skeleton questions */}
        <div className="mt-8 w-full max-w-sm space-y-3 px-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" style={{ animationDelay: `${i * 200}ms`, opacity: 1 - i * 0.2 }} />
          ))}
        </div>
        <Button variant="ghost" onClick={onClose} className="mt-8 text-muted-foreground">Cancel</Button>
      </div>
    );
  }

  // ──── Error State ────
  if (quizState === "error") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Oops!</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadQuiz} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
            </Button>
            <Button onClick={onClose} variant="outline">Tutup</Button>
          </div>
        </div>
      </div>
    );
  }

  // ──── Submitting State ────
  if (quizState === "submitting") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="h-6 w-6 text-primary/50" />
          </div>
        </div>
        <p className="text-lg text-muted-foreground mt-6">Mengirim jawaban...</p>
      </div>
    );
  }

  // ──── Completed State ────
  if (quizState === "completed" && result) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        {showConfetti && <ConfettiEffect />}
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 fade-in duration-500">
          {/* Trophy with glow */}
          <div className="relative mx-auto w-fit">
            <div className="h-28 w-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 rotate-3">
              <Trophy className="h-14 w-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 h-10 w-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg -rotate-12">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
          </div>

          {/* Score */}
          <div className="space-y-3">
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Selamat! 🎉
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-600">{result.percentage}%</div>
                <div className="text-xs text-muted-foreground mt-1">Score</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-4xl font-black text-foreground">{result.score}/{result.total}</div>
                <div className="text-xs text-muted-foreground mt-1">Benar</div>
              </div>
              {result.timeTaken && (
                <>
                  <div className="h-12 w-px bg-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      {formatTime(result.timeTaken)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Waktu</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* XP earned */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-semibold">
            <Zap className="h-4 w-4" />
            +100 XP earned!
          </div>

          <p className="text-muted-foreground text-sm">
            Topik ini sekarang ditandai sebagai selesai. Lanjutkan belajar! 💪
          </p>

          <Button onClick={onClose} size="lg" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 h-12 text-base">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Lanjutkan Belajar
          </Button>
        </div>
      </div>
    );
  }

  // ──── Failed State ────
  if (quizState === "failed" && result) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-auto">
        {/* Header */}
        <div className="p-6 text-center space-y-4 border-b bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10">
          <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25 rotate-3">
            <XCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Belum Berhasil!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Score: <span className="font-bold text-amber-600">{result.percentage}%</span> — Butuh {PASSING_PERCENTAGE}% untuk lulus
            </p>
            <p className="text-xs text-muted-foreground">
              {result.score}/{result.total} benar
              {result.timeTaken && ` • ${formatTime(result.timeTaken)}`}
            </p>
          </div>
        </div>

        {/* Review answers */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <BookOpen className="h-4 w-4" /> Review Jawaban
            </h3>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-colors",
                    isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50"
                      : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-2">Q{i + 1}: {q.question}</p>
                      {!isCorrect && (
                        <div className="space-y-1 text-xs">
                          <p className="text-red-600 dark:text-red-400">
                            ✗ Jawabanmu: {q.options[answers[i] ?? 0]}
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ Benar: {q.options[q.correctIndex]}
                          </p>
                        </div>
                      )}
                      {isCorrect && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Benar: {q.options[q.correctIndex]}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/50 p-2 rounded-lg">
                        💡 {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button onClick={loadQuiz} className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white shadow-lg shadow-violet-500/25" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
            </Button>
            <Button onClick={onClose} variant="outline" size="lg" className="h-11">Tutup</Button>
          </div>
        </div>
      </div>
    );
  }

  // ──── Timeout State ────
  if (quizState === "timeout" && result) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="h-24 w-24 bg-gradient-to-br from-red-400 to-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30">
            <Clock className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-red-500">Waktu Habis!</h2>
            <p className="text-muted-foreground mt-2">
              Score: {result.percentage}% — Butuh {PASSING_PERCENTAGE}% untuk lulus
            </p>
            <p className="text-sm text-muted-foreground">{result.score}/{result.total} benar</p>
          </div>
          <p className="text-muted-foreground text-sm">Jangan menyerah! Kamu bisa coba lagi.</p>
          <div className="flex gap-3">
            <Button onClick={loadQuiz} size="lg" className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white h-11">
              <RefreshCw className="h-5 w-5 mr-2" /> Coba Lagi
            </Button>
            <Button onClick={onClose} variant="outline" size="lg" className="h-11">Tutup</Button>
          </div>
        </div>
      </div>
    );
  }

  // ──── Quiz In Progress ────
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = answers.filter(a => a !== null).length;
  const allAnswered = answeredCount === questions.length;
  const isWarning = remainingTime <= WARNING_TIME;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* ── Header ── */}
      <div className="border-b bg-gradient-to-r from-violet-50/50 via-transparent to-indigo-50/50 dark:from-violet-900/10 dark:to-indigo-900/10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold leading-tight truncate">{topic}</h1>
                <p className="text-[10px] text-muted-foreground">
                  {answeredCount}/{questions.length} dijawab
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Circular Timer */}
              <CircularTimer remaining={remainingTime} total={QUIZ_TIME_LIMIT} isWarning={isWarning} />

              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question Navigation Pills */}
          <div className="flex items-center gap-1.5 mt-3 justify-center">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== null;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-bold transition-all duration-200",
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-110"
                      : isAnswered
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:scale-105"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Question Area ── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <QuizQuestionCard
            question={currentQuestion}
            selectedAnswer={currentAnswer}
            onSelect={handleAnswer}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        </div>
      </div>

      {/* ── Footer Navigation ── */}
      <div className="border-t bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="h-10 gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Sebelumnya
            </Button>
            <Button
              variant="ghost"
              onClick={handleUndo}
              disabled={answerHistory.length === 0}
              className="h-10 text-muted-foreground"
            >
              <Undo2 className="h-4 w-4 mr-1" /> Undo
            </Button>
          </div>

          <div className="flex gap-2">
            {!isLastQuestion ? (
              <Button
                onClick={handleNext}
                disabled={currentAnswer === null}
                className="h-10 gap-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white shadow-md shadow-violet-500/20"
              >
                Selanjutnya <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="h-10 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="h-4 w-4" /> Kirim Jawaban
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
