import { Check } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { CurriculumQuestion, QuestionAnswer } from "@/lib/api/types";
import { QuestionPage } from "@/lib/student/lessons/build";

type QuestionPageViewProps = {
  page: QuestionPage;
  questionAnswers: QuestionAnswer[];
  onAnswer: (answer: QuestionAnswer) => void;
  readOnly?: boolean;
};

type SingleQuestionProps = {
  question: CurriculumQuestion;
  answer?: QuestionAnswer;
  onAnswer: (answer: QuestionAnswer) => void;
  readOnly: boolean;
}

export function QuestionPageView({
  page,
  questionAnswers,
  onAnswer,
  readOnly = false,
}: QuestionPageViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {page.questions.map((question) => (
        <SingleQuestion
          key={question.id}
          question={question}
          answer={questionAnswers.find(
            (answer) => answer.questionId === question.id
          )}
          onAnswer={onAnswer}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

export function SingleQuestion({
  question,
  answer,
  onAnswer,
  readOnly = false,
}: SingleQuestionProps) {
  const answered = !!answer;

  function handleSelect(optionId: string) {
    if (answered || readOnly) return;

    onAnswer({
      questionId: question.id,
      optionId,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2" data-tour="lesson-question">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple">
          Quick Check
        </p>

        <h2
          className="text-2xl font-bold leading-tight text-text-primary"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {question.question}
        </h2>

        <p className="text-sm leading-6 text-text-secondary">
          Choose the answer that you think is correct.
        </p>
      </div>

      <div className="flex flex-col gap-3" data-tour="lesson-question-options">
        {question.options.map((option, index) => {
          const selected = answer?.optionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered || readOnly}
              onClick={() => handleSelect(option.id)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all",
                "flex items-center gap-4",
                selected
                  ? "border-purple bg-purple/5"
                  : "border-border bg-bg-card hover:border-purple/40 hover:bg-purple/[0.02]",
                answered || readOnly
                  ? "cursor-default"
                  : "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  "text-sm font-semibold",
                  selected
                    ? "bg-purple text-white"
                    : "bg-bg-page text-text-secondary border border-border"
                )}
              >
                {selected ? <Check size={16} /> : String.fromCharCode(65 + index)}
              </span>

              <span className="text-sm leading-6 text-text-primary">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <p className="text-sm font-medium text-success">
          Answer saved. You can continue to the next part.
        </p>
      )}
    </div>
  );
}