// ExamForge — QuizRenderer Component
// Multiple-choice quiz with one question at a time (chunked cards), correct/
// incorrect feedback with SVG icons, final score with SlothMascot. Zero emojis.

"use client";

import { useState, useCallback } from "react";
import { SlothMascot } from "@/components/ui/SlothMascot";
import { TactileButton } from "@/components/ui/TactileButton";
import { CheckIcon, CrossIcon } from "@/components/ui/icons/SlothIcons";

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

interface QuizRendererProps {
  questions: QuizQuestion[];
}

export function QuizRenderer({ questions }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;
  const totalQuestions = questions.length;

  const handleSelectAnswer = useCallback(
    (answer: string) => {
      if (showFeedback) return;
      setSelectedAnswer(answer);
      setShowFeedback(true);
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    },
    [showFeedback, currentQuestion],
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setQuizComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  }, [isLastQuestion]);

  if (quizComplete) {
    const correctCount = questions.filter(
      (q) => answers[q.id] === q.correctAnswer,
    ).length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const scoreColor =
      score >= 80
        ? "text-success"
        : score >= 50
          ? "text-warning"
          : "text-error";

    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-8 text-center space-y-6 shadow-[0_6px_0_0_#FDE68A]" role="status" aria-label="Quiz results">
        <SlothMascot pose="cheering" size={120} className="mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-amber-950">Quiz Complete!</h2>
          <div className={`text-5xl font-bold ${scoreColor}`}>{score}%</div>
          <p className="text-sm text-muted-foreground">
            {correctCount} of {totalQuestions} correct
          </p>
        </div>

        <div className="space-y-3 text-left max-w-md mx-auto">
          {questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={`rounded-lg border p-4 ${
                  isCorrect
                    ? "border-success-border bg-success-surface"
                    : "border-error-border bg-error-surface"
                }`}
              >
                <p className="text-sm font-medium mb-1">
                  {index + 1}. {q.prompt}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  {isCorrect ? (
                    <span className="text-success font-medium">Correct</span>
                  ) : (
                    <>
                      <span className="text-error font-medium">Incorrect</span>
                      <span className="text-muted-foreground">
                        &mdash; Your answer: {userAnswer ?? "None"}
                      </span>
                      <span className="text-muted-foreground">
                        &mdash; Correct: {q.correctAnswer}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4">
          <TactileButton
            variant="amber"
            onClick={() => {
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setShowFeedback(false);
              setAnswers({});
              setQuizComplete(false);
            }}
          >
            Try Again
          </TactileButton>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {currentIndex + 1} of {totalQuestions}</span>
        <span className="text-xs">{Object.keys(answers).length} answered</span>
      </div>

      <div
        className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-6 space-y-4 shadow-[0_6px_0_0_#FDE68A]">
        <p className="text-base font-bold text-amber-950">{currentQuestion.prompt}</p>

        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isOptionCorrect = option === currentQuestion.correctAnswer;
            let optionStyle = "hover:bg-accent/50";

            if (showFeedback) {
              if (isOptionCorrect) {
                optionStyle = "border-success-border bg-success-surface";
              } else if (isSelected && !isOptionCorrect) {
                optionStyle = "border-error-border bg-error-surface";
              }
            } else if (isSelected) {
              optionStyle = "border-primary bg-primary/5";
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={showFeedback}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors cursor-pointer disabled:cursor-default ${optionStyle}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Option ${index + 1}: ${option}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {showFeedback && isOptionCorrect && (
                  <CheckIcon className="ml-auto h-4 w-4 text-success" color="#46A872" />
                )}
                {showFeedback && isSelected && !isOptionCorrect && (
                  <CrossIcon className="ml-auto h-4 w-4 text-error" color="#D9534F" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className="space-y-4">
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              isCorrect
                ? "bg-success-surface border border-success-border text-success"
                : "bg-error-surface border border-error-border text-error"
            }`}
            role="status"
            aria-live="polite"
          >
            {isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`}
          </div>

          <div className="flex justify-end">
            <TactileButton variant="primary" onClick={handleNext}>
              {isLastQuestion ? "See Results" : "Next Question"}
            </TactileButton>
          </div>
        </div>
      )}
    </div>
  );
}
