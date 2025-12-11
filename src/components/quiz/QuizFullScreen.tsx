import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { generateQuiz, submitQuiz, addXp, type QuizQuestion } from "@/lib/api";
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
  Clock
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface QuizFullScreenProps {
  topic: string;
  description?: string;
  nodeId: string;
  onComplete: () => void;
  onClose: () => void;
}

type QuizState = "loading" | "ready" | "submitting" | "completed" | "failed" | "error" | "timeout";

const PASSING_PERCENTAGE = 90;
const QUIZ_TIME_LIMIT = 300; // 5 minutes in seconds
const WARNING_TIME = 60; // Show warning when 1 minute left

export function QuizFullScreen({ 
  topic, 
  description, 
  nodeId,
  onComplete, 
  onClose 
}: QuizFullScreenProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [answerHistory, setAnswerHistory] = useState<{index: number, value: number | null}[]>([]);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{score: number; total: number; percentage: number; timeTaken?: number} | null>(null);
  
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
    
    // Reset timer to 5 minutes
    setRemainingTime(QUIZ_TIME_LIMIT);
    hasAutoSubmitted.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const response = await generateQuiz(topic, description);
      setQuestions(response.questions);
      setAnswers(new Array(response.questions.length).fill(null));
      setQuizState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
      setQuizState("error");
    }
  };

  // Timer effect - countdown from 5 minutes
  useEffect(() => {
    if (quizState === "ready" && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Time's up - will trigger auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup timer when quiz ends or unmounts
    if (quizState === "completed" || quizState === "failed" || quizState === "error" || quizState === "timeout") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizState]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (remainingTime === 0 && quizState === "ready" && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleAutoSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime, quizState]);

  // Load quiz on mount
  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const handleAnswer = (answerIndex: number) => {
    // Save to history for undo
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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setError("Please login to submit quiz");
      setQuizState("error");
      return;
    }
    
    if (!currentRoadmapId) {
      setError("Simpan roadmap terlebih dahulu sebelum mengerjakan quiz (Ctrl+S atau klik tombol Save)");
      setQuizState("error");
      return;
    }

    // Check if all questions answered
    if (answers.some(a => a === null)) {
      setError("Please answer all questions before submitting");
      return;
    }

    // Calculate time taken (5 minutes - remaining time)
    const timeTaken = QUIZ_TIME_LIMIT - remainingTime;

    setQuizState("submitting");

    try {
      const submitResult = await submitQuiz({
        roadmapId: currentRoadmapId,
        nodeId,
        userId: user.id,
        answers: answers as number[],
        questions,
        timeTaken,
      });

      setResult({
        score: submitResult.score,
        total: submitResult.totalQuestions,
        percentage: submitResult.percentage,
        timeTaken,
      });

      if (submitResult.passed) {
        setQuizState("completed");
        // Award XP for passing quiz (100 XP per quiz)
        try {
          await addXp(user.id, 100);
        } catch (xpErr) {
          console.error("Failed to add XP:", xpErr);
        }
        onComplete();
      } else {
        setQuizState("failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      setQuizState("error");
    }
  };

  // Auto-submit when time runs out (submit with whatever answers exist)
  const handleAutoSubmit = async () => {
    if (!user?.id || !currentRoadmapId) {
      setQuizState("timeout");
      return;
    }

    // Fill unanswered questions with -1 (wrong answer)
    const finalAnswers = answers.map(a => a === null ? -1 : a);
    const timeTaken = QUIZ_TIME_LIMIT;

    setQuizState("submitting");

    try {
      const submitResult = await submitQuiz({
        roadmapId: currentRoadmapId,
        nodeId,
        userId: user.id,
        answers: finalAnswers,
        questions,
        timeTaken,
      });

      setResult({
        score: submitResult.score,
        total: submitResult.totalQuestions,
        percentage: submitResult.percentage,
        timeTaken,
      });

      if (submitResult.passed) {
        setQuizState("completed");
        // Award XP for passing quiz (100 XP per quiz)
        try {
          await addXp(user.id, 100);
        } catch (xpErr) {
          console.error("Failed to add XP:", xpErr);
        }
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

  // Loading state
  if (quizState === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Generating quiz for "{topic}"...</p>
        <Button variant="ghost" onClick={onClose} className="mt-8">
          Cancel
        </Button>
      </div>
    );
  }

  // Error state
  if (quizState === "error") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <div className="flex gap-3">
          <Button onClick={loadQuiz} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Submitting state
  if (quizState === "submitting") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Submitting your answers...</p>
      </div>
    );
  }

  // Completed state
  if (quizState === "completed" && result) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="h-12 w-12 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-600 mb-2">Congratulations!</h2>
            <p className="text-lg text-muted-foreground">
              You passed the quiz with {result.percentage}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Score: {result.score}/{result.total} correct
            </p>
            {result.timeTaken && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-2">
                <Clock className="h-4 w-4" />
                <span>Completed in {formatTime(result.timeTaken)}</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            This topic is now marked as complete. Great job!
          </p>
          <Button onClick={onClose} size="lg" className="w-full">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }

  // Failed state
  if (quizState === "failed" && result) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-8 overflow-auto">
        <div className="max-w-2xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Not Quite There!</h2>
              <p className="text-lg text-muted-foreground">
                You scored {result.percentage}% - Need {PASSING_PERCENTAGE}% to pass
              </p>
              <p className="text-sm text-muted-foreground">
                Score: {result.score}/{result.total} correct
              </p>
              {result.timeTaken && (
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Clock className="h-4 w-4" />
                  <span>Time: {formatTime(result.timeTaken)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wrong answers */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Review your answers:</h3>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div 
                  key={i} 
                  className={`p-4 rounded-lg border ${
                    isCorrect 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <p className="font-medium mb-2">
                    Q{i + 1}: {q.question}
                  </p>
                  {!isCorrect && (
                    <>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Your answer: {q.options[answers[i] || 0]}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Correct: {q.options[q.correctIndex]}
                      </p>
                    </>
                  )}
                  {isCorrect && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      ✓ Correct: {q.options[q.correctIndex]}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 sticky bottom-0 bg-background py-4">
            <Button onClick={loadQuiz} className="flex-1" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again (New Questions)
            </Button>
            <Button onClick={onClose} variant="outline" size="lg">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Timeout state - time ran out
  if (quizState === "timeout" && result) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-24 w-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-12 w-12 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-red-600 mb-2">Time's Up!</h2>
            <p className="text-lg text-muted-foreground">
              You scored {result.percentage}% - Need {PASSING_PERCENTAGE}% to pass
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Score: {result.score}/{result.total} correct
            </p>
          </div>
          <p className="text-muted-foreground">
            Don't worry! You can try again with new questions.
          </p>
          <div className="flex gap-3">
            <Button onClick={loadQuiz} size="lg" className="flex-1">
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </Button>
            <Button onClick={onClose} variant="outline" size="lg">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{topic}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length} • {answeredCount} answered
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer Display - Countdown */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
              remainingTime <= WARNING_TIME 
                ? "bg-red-100 dark:bg-red-900/30 text-red-600" 
                : "bg-muted text-muted-foreground"
            }`}>
              <Clock className={`h-4 w-4 ${remainingTime <= WARNING_TIME ? "animate-pulse" : ""}`} />
              <span className="font-mono font-medium tabular-nums">{formatTime(remainingTime)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto py-8">
          <QuizQuestionCard
            question={currentQuestion}
            selectedAnswer={currentAnswer}
            onSelect={handleAnswer}
            questionNumber={currentIndex + 1}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              onClick={handleUndo}
              disabled={answerHistory.length === 0}
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>
          </div>

          <div className="flex gap-2">
            {!isLastQuestion ? (
              <Button
                onClick={handleNext}
                disabled={currentAnswer === null}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
