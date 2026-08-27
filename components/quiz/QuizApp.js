'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import TrackEvent, { trackClick } from '@/components/TrackEvent';
import ProgressBar from './ProgressBar';
import ContactStep from './ContactStep';
import QuestionScreen from './QuestionScreen';
import { ALL_QUESTIONS } from '@/lib/quizData';

const STEP_CONTACT = 'contact';

export default function QuizApp() {
  const router = useRouter();
  // Questions first, contact details (with the marketing consent gate) last, right
  // before the result is revealed — captures intent before asking for an email.
  const steps = useMemo(() => [...ALL_QUESTIONS.map((q) => q.id), STEP_CONTACT], []);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const currentStepId = steps[stepIndex];

  async function submitQuiz(contact, finalAnswers) {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, answers: finalAnswers }),
      });
      if (!res.ok) throw new Error('submit_failed');
      const data = await res.json();
      router.push(`/results/${data.id}`);
    } catch (err) {
      setSubmitError("Something went wrong sending your result. Try again in a moment.");
      setSubmitting(false);
    }
  }

  function handleContactSubmit(values) {
    setContact(values);
    trackClick('contact_complete');
    submitQuiz(values, answers);
  }

  function handleAnswer(questionId, value) {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);
    setStepIndex(stepIndex + 1);
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  const questionNumber = stepIndex + 1;
  const currentQuestion = currentStepId === STEP_CONTACT ? null : ALL_QUESTIONS[stepIndex];

  return (
    <main className="min-h-screen flex flex-col">
      <TrackEvent event="quiz_start" />

      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <span className="text-xs uppercase tracking-[0.14em] text-white/50">Founder Energy Quiz</span>
      </header>

      <ProgressBar step={stepIndex} total={steps.length - 1} />

      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-xl">
          {currentStepId === STEP_CONTACT && !submitting && (
            <ContactStep onSubmit={handleContactSubmit} onBack={handleBack} />
          )}

          {currentQuestion && !submitting && (
            <QuestionScreen
              question={currentQuestion}
              index={questionNumber}
              total={ALL_QUESTIONS.length}
              value={answers[currentQuestion.id]}
              onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
              onBack={handleBack}
            />
          )}

          {submitting && (
            <div className="rounded-2xl bg-white p-8 text-center text-navy-700">
              <p className="text-lg">Working out your result…</p>
            </div>
          )}

          {submitError && (
            <div className="mt-4 rounded-lg bg-white/10 p-4 text-center text-sm text-white">
              {submitError}
              <button type="button" className="ml-2 underline" onClick={() => submitQuiz(contact, answers)}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
