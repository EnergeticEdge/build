'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
      setSubmitError('Something went wrong sending your result. Try again in a moment.');
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
  const isCapture = currentStepId === STEP_CONTACT;

  return (
    <main className="quiz-shell">
      <TrackEvent event="quiz_start" />

      {!isCapture && !submitting && (
        <>
          <ProgressBar step={stepIndex} total={steps.length - 1} />
          <div className="quiz-body">
            {currentQuestion && (
              <QuestionScreen
                question={currentQuestion}
                index={questionNumber}
                total={ALL_QUESTIONS.length}
                value={answers[currentQuestion.id]}
                onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
              />
            )}
          </div>
          <div className="quiz-footer-nav">
            <button type="button" className="back-link" onClick={handleBack}>
              &larr; Back
            </button>
          </div>
        </>
      )}

      {isCapture && !submitting && (
        <div className="capture-body">
          <ContactStep onSubmit={handleContactSubmit} />
        </div>
      )}

      {submitting && (
        <div className="capture-body">
          <div className="capture-card">
            <p className="sub">Working out your result…</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="narrow" style={{ textAlign: 'center', paddingBottom: 24 }}>
          <p className="microcopy" style={{ color: 'var(--orange)' }}>
            {submitError}{' '}
            <button
              type="button"
              onClick={() => submitQuiz(contact, answers)}
              style={{ textDecoration: 'underline', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
          </p>
        </div>
      )}

      <p className="tagline-footer">Energy is revenue. Focus is profit.</p>
    </main>
  );
}
