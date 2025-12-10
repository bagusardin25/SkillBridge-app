import { type QuizQuestion } from "@/lib/api";
import { cn } from "@/lib/utils";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  questionNumber: number;
}

const optionLabels = ["A", "B", "C", "D"];

export function QuizQuestionCard({
  question,
  selectedAnswer,
  onSelect,
  questionNumber,
}: QuizQuestionCardProps) {
  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium leading-relaxed">
          <span className="text-primary font-bold">Q{questionNumber}.</span>{" "}
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-card"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {optionLabels[index]}
              </span>
              <span className="text-sm pt-0.5">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
