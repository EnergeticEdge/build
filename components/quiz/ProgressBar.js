export default function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="quiz-topbar">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-label">
        Question {Math.min(step + 1, total)} of {total}
      </p>
    </div>
  );
}
