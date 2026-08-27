'use client';

import { useState } from 'react';

export default function QuestionScreen({ question, index, total, value, onAnswer, onBack }) {
  const [notes, setNotes] = useState(value ?? '');
  const isFreeText = Boolean(question.optional);

  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8 text-navy-700">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
        Question {index} of {total}
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl leading-tight">{question.text}</h1>

      {!isFreeText && (
        <div className="mt-6 flex flex-col gap-3">
          {question.options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onAnswer(opt.value)}
              className={`text-left rounded-xl border-[1.5px] px-5 py-4 text-base transition ${
                value === opt.value
                  ? 'border-orange bg-orange/5'
                  : 'border-navy-100 hover:border-orange hover:bg-orange/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {isFreeText && (
        <div className="mt-6">
          <textarea
            className="w-full min-h-[140px] rounded-lg border border-navy-100 px-4 py-4 text-base focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/40"
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            type="button"
            onClick={() => onAnswer(notes.trim())}
            className="mt-4 w-full rounded-lg bg-orange px-6 py-4 font-sans font-bold text-white transition hover:-translate-y-0.5 sm:w-auto"
          >
            Continue →
          </button>
        </div>
      )}

      <button type="button" onClick={onBack} className="mt-6 text-sm text-navy-300 hover:text-navy-600">
        ← Back
      </button>
    </div>
  );
}
