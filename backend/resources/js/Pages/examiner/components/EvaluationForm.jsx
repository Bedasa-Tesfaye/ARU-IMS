import React, { useMemo } from 'react';
import './EvaluationForm.css';

const criteriaByType = {
  final: [
    { key: 'technical_score', label: 'Technical (30%)', weight: 0.3 },
    { key: 'documentation_score', label: 'Structure (20%)', weight: 0.2 },
    { key: 'methodology_score', label: 'Methodology (20%)', weight: 0.2 },
    { key: 'learning_score', label: 'Learning (20%)', weight: 0.2 },
    { key: 'presentation_score', label: 'Presentation (10%)', weight: 0.1 },
  ],
  midterm: [
    { key: 'technical_score', label: 'Technical (40%)', weight: 0.4 },
    { key: 'documentation_score', label: 'Structure (30%)', weight: 0.3 },
    { key: 'presentation_score', label: 'Presentation (30%)', weight: 0.3 },
  ],
  /** After the student returns to campus — oral defense & evidence review (stored as report_type "campus"). */
  campus: [
    { key: 'technical_score', label: 'Technical depth (25%)', weight: 0.25 },
    { key: 'documentation_score', label: 'Report & evidence (25%)', weight: 0.25 },
    { key: 'presentation_score', label: 'Oral defense (25%)', weight: 0.25 },
    { key: 'learning_score', label: 'Reflection & learning (25%)', weight: 0.25 },
  ],
};

const scoreToGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  return 'D';
};

const EvaluationForm = ({ draft, setDraft, onSuggest, onSubmit }) => {
  const reportType = draft.report_type || 'final';
  const criteria = criteriaByType[reportType] || criteriaByType.final;
  const typeHint =
    reportType === 'campus'
      ? 'Campus evaluation counts toward the official composite grade with company internship reviews.'
      : '';

  const computed = useMemo(() => {
    const total = criteria.reduce((sum, c) => sum + (Number(draft[c.key]) || 0) * c.weight, 0);
    return {
      overall: Number.isFinite(total) ? Number(total.toFixed(1)) : 0,
      grade: scoreToGrade(total || 0),
    };
  }, [criteria, draft]);

  return (
    <div className="evaluation-form">
      <div className="evaluation-top">
        <select value={reportType} onChange={(e) => setDraft((d) => ({ ...d, report_type: e.target.value }))}>
          <option value="campus">Campus / return evaluation</option>
          <option value="final">Final report</option>
          <option value="midterm">Mid-term report</option>
        </select>
        <input
          placeholder="Grade"
          value={draft.grade || computed.grade}
          onChange={(e) => setDraft((d) => ({ ...d, grade: e.target.value }))}
        />
      </div>
      {typeHint && <p className="evaluation-type-hint">{typeHint}</p>}
      <div className="evaluation-criteria">
        {criteria.map((c) => (
          <label key={c.key}>
            <span>{c.label}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={draft[c.key] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [c.key]: Number(e.target.value) }))}
            />
          </label>
        ))}
      </div>
      <div className="evaluation-score-line">
        <strong>Overall Score: {draft.overall_score || computed.overall}</strong>
        <span>Grade: {draft.grade || computed.grade}</span>
      </div>
      <textarea
        placeholder="Feedback strengths and improvements..."
        value={draft.comments || ''}
        onChange={(e) => setDraft((d) => ({ ...d, comments: e.target.value }))}
      />
      <div className="evaluation-actions">
        <button type="button" className="examiner-btn secondary" onClick={onSuggest}>AI Draft</button>
        <button type="button" className="examiner-btn" onClick={() => onSubmit(computed)}>Submit</button>
      </div>
    </div>
  );
};

export default EvaluationForm;
