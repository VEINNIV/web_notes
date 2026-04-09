import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['N'], description: 'Create a new note' },
  { keys: ['Double-click'], description: 'Create note at cursor position' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Delete'], description: 'Remove selected node/edge' },
  { keys: ['Esc'], description: 'Close editor or modal' },
];

const modalOverlay = {
  position: 'fixed', inset: 0, zIndex: 99999,
  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const modalCard = {
  background: 'var(--surface)', borderRadius: 16,
  boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
  border: '1px solid var(--border)',
  width: '100%', maxWidth: 420, padding: 0,
  animation: 'modalIn 0.2s cubic-bezier(0.16,1,0.3,1)',
};

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 20px', borderBottom: '1px solid var(--border)',
};

const titleStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 15, fontWeight: 600, color: 'var(--text)',
};

const closeStyle = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex',
};

const listStyle = { padding: '12px 20px 20px', listStyle: 'none' };

const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 0', borderBottom: '1px solid var(--surface-2)',
};

const descStyle = { fontSize: 13, color: 'var(--text-muted)' };

const kbdGroupStyle = { display: 'flex', gap: 4 };

const kbdStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 28, padding: '3px 8px', fontSize: 11, fontWeight: 600,
  fontFamily: 'var(--font)', color: 'var(--text)',
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
};

export default function KeyboardShortcutsModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={titleStyle}>
            <Keyboard size={16} /> Keyboard Shortcuts
          </span>
          <button style={closeStyle} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <ul style={listStyle}>
          {SHORTCUTS.map((s, i) => (
            <li key={i} style={{
              ...rowStyle,
              borderBottom: i === SHORTCUTS.length - 1 ? 'none' : rowStyle.borderBottom,
            }}>
              <span style={descStyle}>{s.description}</span>
              <span style={kbdGroupStyle}>
                {s.keys.map((k, j) => (
                  <React.Fragment key={k}>
                    {j > 0 && <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>+</span>}
                    <kbd style={kbdStyle}>{k}</kbd>
                  </React.Fragment>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
