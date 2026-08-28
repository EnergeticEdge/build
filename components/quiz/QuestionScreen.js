'use client';

import { useMemo, useState } from 'react';

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuestionScreen({ question, index, total, value, onAnswer }) {
  const [notes, setNotes] = useState(value ?? '');
  const isFreeText = Boolean(question.optional);

  // Shuffle once per question so option order doesn't telegraph which answer
  // scores highest, but stays stable across re-renders of the same question.
  const options = useMemo(
    () => (question.options ? shuffle(question.options) : []),
    [question.id]
  );

  return (
    <div className="quiz-card">
      <h1 className="quiz-question">{question.text}</h1>

      {!isFreeText && (
        <div className="answer-list">
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onAnswer(opt.value)}
              className={`answer-card${value === opt.value ? ' selected' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {isFreeText && (
        <div className="field">
          <textarea
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            type="button"
            onClick={() => onAnswer(notes.trim())}
            className="btn btn-orange btn-large"
            style={{ marginTop: 18 }}
          >
            Continue &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
