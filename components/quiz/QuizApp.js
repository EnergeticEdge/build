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
  const steps = useMemo(() => [STEP_CONTACT, ...ALL_QUESTIONS.map((q) => q.id)], []);
  const [stepIndex, setStepIndex] = useState(0);
  const [contact, setContact] = useState({ firstName: '', email: '', phone: '' });
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const currentStepId = steps[stepIndex];

  async function submitQuiz(finalAnswers) {
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

  function handleContactNext(values) {
    setContact(values);
    trackClick('contact_complete');
    setStepIndex(1);
  }

  function handleAnswer(questionId, value) {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);

    const nextIndex = stepIndex + 1;
    if (nextIndex >= steps.length) {
      submitQuiz(nextAnswers);
    } else {
      setStepIndex(nextIndex);
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  const questionNumber = stepIndex; // step 1 = question 1
  const currentQuestion = currentStepId === STEP_CONTACT ? null : ALL_QUESTIONS[stepIndex - 1];

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
          {currentStepId === STEP_CONTACT && <ContactStep value={contact} onNext={handleContactNext} />}

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
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => submitQuiz(answers)}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
