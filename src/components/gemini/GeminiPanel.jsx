/**
 * GeminiPanel.jsx — AI assistant panel embedded in the NoteEditor.
 *
 * Three modes:
 *  - summarize : Condenses the note into bullet points
 *  - quiz      : Generates short-answer questions for self-testing
 *  - expand    : Adds related context and detail
 *
 * The API key check is done in the service layer.
 * If no key is set, an error guides the user to Settings.
 *
 * The result is rendered as plain text (preserves line breaks).
 * Previous results are cleared when the mode changes.
 */

import React, { useState } from 'react';
import { Sparkles, BookOpen, HelpCircle, ArrowRight, Loader } from 'lucide-react';
import { summarizeNote, quizNote, expandNote } from '../../services/gemini';
import styles from './GeminiPanel.module.css';

/** Available AI modes with labels and icons. */
const MODES = [
  {
    id:    'summarize',
    label: 'Summarize',
    icon:  <Sparkles size={13} />,
    fn:    summarizeNote,
  },
  {
    id:    'quiz',
    label: 'Quiz Me',
    icon:  <HelpCircle size={13} />,
    fn:    quizNote,
  },
  {
    id:    'expand',
    label: 'Expand',
    icon:  <BookOpen size={13} />,
    fn:    expandNote,
  },
];

/**
 * @param {Object}   props
 * @param {Object}   props.note     - The current note (passed to the AI)
 * @param {Function} props.onClose  - Callback to close this panel
 */
export default function GeminiPanel({ note }) {
  const [activeMode, setActiveMode]   = useState(null);
  const [result, setResult]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  async function runMode(mode) {
    setActiveMode(mode.id);
    setResult('');
    setError('');
    setLoading(true);

    try {
      const text = await mode.fn(note);
      setResult(text);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.panel}>
      {/* ── Mode buttons ─────────────────────────────────────────────── */}
      <div className={styles.modes}>
        <Sparkles size={13} className={styles.icon} />
        {MODES.map((mode) => (
          <button
            key={mode.id}
            className={`${styles.modeBtn} ${activeMode === mode.id ? styles.modeBtnActive : ''}`}
            onClick={() => runMode(mode)}
            disabled={loading}
            aria-pressed={activeMode === mode.id}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      {/* ── Result / Loading / Error ──────────────────────────────────── */}
      {loading && (
        <div className={styles.loading}>
          <Loader size={14} className={styles.spinner} />
          <span>Thinking…</span>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          {error.includes('API key') && (
            <span className={styles.hint}>
              Add your Gemini key in the Settings panel (toolbar).
            </span>
          )}
        </div>
      )}

      {result && !loading && (
        <div className={styles.result}>
          {result.split('\n').map((line, i) => (
            // Render each line; blank lines become spacers
            line.trim()
              ? <p key={i} className={styles.resultLine}>{line}</p>
              : <div key={i} className={styles.resultSpacer} />
          ))}
        </div>
      )}
    </div>
  );
}
