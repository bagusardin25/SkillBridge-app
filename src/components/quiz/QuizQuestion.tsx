import { type QuizQuestion } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  questionNumber: number;
  totalQuestions?: number;
}

const optionLabels = ["A", "B", "C", "D"];

const optionGradients = [
  "from-blue-500/10 to-blue-600/5 border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/10",
  "from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10",
  "from-amber-500/10 to-amber-600/5 border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10",
  "from-violet-500/10 to-violet-600/5 border-violet-500/30 hover:border-violet-500/60 hover:shadow-violet-500/10",
];

const selectedGradients = [
  "from-blue-500 to-blue-600 border-blue-500 shadow-blue-500/25",
  "from-emerald-500 to-emerald-600 border-emerald-500 shadow-emerald-500/25",
  "from-amber-500 to-amber-600 border-amber-500 shadow-amber-500/25",
  "from-violet-500 to-violet-600 border-violet-500 shadow-violet-500/25",
];

const labelColors = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
];

export function QuizQuestionCard({
  question,
  selectedAnswer,
  onSelect,
  questionNumber,
  totalQuestions,
}: QuizQuestionCardProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Question Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary/60">
            Question {questionNumber}{totalQuestions ? ` of ${totalQuestions}` : ""}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold leading-relaxed text-foreground">
          {question.question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                "group relative w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]",
                isSelected
                  ? `bg-gradient-to-r ${selectedGradients[index]} shadow-lg -translate-y-0.5`
                  : `bg-gradient-to-r ${optionGradients[index]} hover:shadow-md`
              )}
            >
              {/* Letter Badge */}
              <span
                className={cn(
                  "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                  isSelected
                    ? "bg-white text-foreground shadow-md scale-110"
                    : labelColors[index]
                )}
              >
                {isSelected ? <Check className="h-5 w-5 text-emerald-600" strokeWidth={3} /> : optionLabels[index]}
              </span>

              {/* Option Text */}
              <span className={cn(
                "text-sm sm:text-base font-medium flex-1 transition-colors duration-200",
                isSelected ? "text-white" : "text-foreground/90"
              )}>
                {option}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
