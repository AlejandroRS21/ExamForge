// OpenSloth — Answer Input Resolver
// Routes to the correct question type component based on question.type

"use client";

import {
  MultipleChoice,
  ClozeInput,
  WordForm,
  KeyTransform,
  GapText,
  MatchItems,
} from "./question-types";

export interface QuestionDisplayData {
  id: string;
  type: string;
  prompt: any;
  options: any | null;
  difficulty: string;
  partNumber: number;
  questionIndex: number;
}

interface AnswerInputProps {
  question: QuestionDisplayData;
  selectedAnswer: any;
  onAnswer: (questionId: string, answer: any) => void;
  disabled?: boolean;
}

export function AnswerInput({
  question,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: AnswerInputProps) {
  switch (question.type) {
    case "MC":
      return (
        <MultipleChoice
          questionId={question.id}
          options={question.options ?? []}
          selectedAnswer={selectedAnswer ?? null}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case "CLOZE":
      return (
        <ClozeInput
          questionId={question.id}
          selectedAnswer={selectedAnswer ?? null}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case "WF":
      return (
        <WordForm
          questionId={question.id}
          selectedAnswer={selectedAnswer ?? null}
          onAnswer={onAnswer}
          disabled={disabled}
          stemWord={question.prompt?.stemWord}
        />
      );

    case "KT":
      return (
        <KeyTransform
          questionId={question.id}
          selectedAnswer={selectedAnswer ?? null}
          onAnswer={onAnswer}
          disabled={disabled}
          leadIn={question.prompt?.leadIn}
          keyword={question.prompt?.keyword}
        />
      );

    case "GT":
      return (
        <GapText
          questionId={question.id}
          items={question.prompt?.items ?? []}
          selectedAnswer={selectedAnswer ?? null}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    case "MM":
      return (
        <MatchItems
          questionId={question.id}
          items={question.prompt?.items ?? []}
          options={question.prompt?.options ?? []}
          selectedAnswer={selectedAnswer ?? null}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Unsupported question type: <code className="font-mono text-xs">{question.type}</code>
        </div>
      );
  }
}
