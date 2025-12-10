import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateQuiz, type QuizQuestion } from "@/lib/api";
import { QuizQuestionCard } from "./QuizQuestion";
import { Loader2, Trophy, RefreshCw, XCircle } from "lucide-react";

interface QuizPanelProps {
  topic: string;
  description?: string;
  onComplete: () => void;
}

type QuizState = "loading" | "ready" | "completed" | "failed" | "error";

export function QuizPanel({ topic, description, onComplete }: QuizPanelProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [error, setError] = useState<string | null>(null);

  // Load quiz on mount
  useEffect(() => {
    loadQuiz();
  }, [topic]);

  const loadQuiz = async () => {
    setQuizState("loading");
    setError(null);
    setCurrentIndex(0);
    setAnswers([]);
    setShowResult(false);

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

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Check results
      checkResults();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const checkResults = () => {
    setShowResult(true);
    const allCorrect = questions.every(
      (q, i) => answers[i] === q.correctIndex
    );
    if (allCorrect) {
      setQuizState("completed");
      onComplete();
    } else {
      setQuizState("failed");
    }
  };

  const getScore = () => {
    return questions.filter((q, i) => answers[i] === q.correctIndex).length;
  };

  // Loading state
  if (quizState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating quiz for "{topic}"...</p>
      </div>
    );
  }

  // Error state
  if (quizState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <XCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button onClick={loadQuiz} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Completed state
  if (quizState === "completed") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <Trophy className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-600">Congratulations!</h3>
        <p className="text-sm text-muted-foreground text-center">
          You've passed the quiz with a perfect score!<br />
          This topic is now marked as complete.
        </p>
      </div>
    );
  }

  // Failed state - show which ones were wrong
  if (quizState === "failed" && showResult) {
    const score = getScore();
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center py-6 space-y-3">
          <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <XCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold">Not Quite!</h3>
          <p className="text-sm text-muted-foreground">
            Score: {score}/{questions.length} correct
          </p>
        </div>

        {/* Show wrong answers with explanations */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctIndex;
            if (isCorrect) return null;
            return (
              <div key={i} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Q{i + 1}: {q.question}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Your answer: {q.options[answers[i] || 0]}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Correct: {q.options[q.correctIndex]}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {q.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <Button onClick={loadQuiz} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuizQuestionCard
        question={currentQuestion}
        selectedAnswer={currentAnswer}
        onSelect={handleAnswer}
        questionNumber={currentIndex + 1}
      />

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentAnswer === null}
          className="flex-1"
        >
          {isLastQuestion ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
