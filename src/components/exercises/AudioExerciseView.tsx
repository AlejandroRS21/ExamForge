// ExamForge — AudioExerciseView Component
// Combines AudioPlayer with comprehension questions and scoring

"use client";

import { useState, useCallback } from "react";
import { AudioPlayer } from "./AudioPlayer";

interface AudioQuestion {
  id: string;
  type: "MC" | "TF";
  question: string;
  options: string[];
  correctAnswer: string;
}

interface AudioExerciseData {
  id: string;
  title: string;
  mimeType: string;
  duration: number | null;
  transcript: string | null;
  questions: { items: AudioQuestion[] } | null;
  audioData: string | null;
  attemptCount: number;
}

interface SubmitResult {
  exerciseId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  details: Array<{
    questionId: string;
    correct: boolean;
    correctAnswer: string;
  }>;
  attemptCount: number;
}

interface AudioExerciseViewProps {
  exercise: AudioExerciseData;
}

export function AudioExerciseView({ exercise }: AudioExerciseViewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const questions = exercise.questions?.items ?? [];

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/exercises/audio/${exercise.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to submit answers");
        return;
      }

      setResult(data as SubmitResult);
      setSubmitted(true);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }, [exercise.id, answers]);

  const handleRetry = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setError(null);
  }, []);

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  // Score color
  const scoreColor =
    result && result.score >= 80
      ? "text-green-600"
      : result && result.score >= 50
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{exercise.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Listening exercise &bull; {exercise.duration ? `${Math.floor(exercise.duration / 60)}:${(exercise.duration % 60).toString().padStart(2, "0")} min` : "Audio"}
          {exercise.attemptCount > 0 && (
            <span className="ml-2">({exercise.attemptCount} attempt{exercise.attemptCount !== 1 ? "s" : ""})</span>
          )}
        </p>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        audioBase64={exercise.audioData}
        mimeType={exercise.mimeType}
        duration={exercise.duration}
      />

      {/* Transcript Toggle */}
      {exercise.transcript && (
        <div className="rounded-xl border bg-card">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium hover:bg-accent/50 transition-colors"
            aria-expanded={showTranscript}
            type="button"
          >
            <span>Transcript</span>
            <svg
              className={`h-4 w-4 transition-transform ${showTranscript ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showTranscript && (
            <div className="border-t px-6 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {exercise.transcript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comprehension Questions */}
      {questions.length > 0 && !submitted && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Comprehension Questions</h2>

          {questions.map((q, index) => (
            <div key={q.id} className="rounded-xl border bg-card p-5">
              <p className="text-sm font-medium mb-3">
                {index + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 cursor-pointer transition-colors
                      ${answers[q.id] === option
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => handleAnswerChange(q.id, option)}
                      className="h-4 w-4 text-primary accent-primary"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {Object.keys(answers).length} of {questions.length} answered
            </span>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              type="button"
            >
              {submitting ? "Submitting..." : "Submit Answers"}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && result && (
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">Results</h2>
            <div className={`text-4xl font-bold ${scoreColor}`}>
              {result.score}%
            </div>
            <p className="text-sm text-muted-foreground">
              {result.correctAnswers} of {result.totalQuestions} correct
            </p>
          </div>

          {/* Question details */}
          <div className="space-y-3">
            {result.details.map((d, index) => {
              const q = questions.find((q) => q.id === d.questionId);
              return (
                <div
                  key={d.questionId}
                  className={`rounded-lg border p-4 ${
                    d.correct
                      ? "border-green-200 bg-green-50/50"
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {index + 1}. {q?.question ?? "Question"}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {d.correct ? (
                      <span className="text-green-700 font-medium">Correct</span>
                    ) : (
                      <>
                        <span className="text-red-700 font-medium">Incorrect</span>
                        <span className="text-muted-foreground">
                          &mdash; Correct answer: {d.correctAnswer}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Retry */}
          <div className="flex justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent transition-colors"
              type="button"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* No questions state */}
      {questions.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No comprehension questions available for this exercise.
          </p>
        </div>
      )}
    </div>
  );
}
