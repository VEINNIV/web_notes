import React, { useRef, useState } from 'react';
import { Plus, Download, Upload, Settings, X, Eye, EyeOff, Search, Maximize } from 'lucide-react';
import { exportBackup, importBackup } from '../../utils/backup';
import styles from './Toolbar.module.css';

export default function Toolbar({ onAddNote, onFitView, onSearch }) {
  const fileInputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('noteflow_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExport = async () => {
    try {
      await exportBackup();
      flash('Backup downloaded.');
    } catch {
      flash('Export failed.');
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Importing will replace all current notes. Continue?')) return;

    setImporting(true);
    try {
      await importBackup(file);
      flash('Import successful!');
    } catch (err) {
      flash(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('noteflow_gemini_key', apiKey.trim());
    flash('API key saved.');
    setTimeout(() => setShowSettings(false), 800);
  };

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={styles.toolbar}>
      {/* Brand deleted to make room for Search (brand is in sidebar) */}
      
      <button className={styles.primaryBtn} onClick={onAddNote} title="New note (N)">
        <Plus size={15} strokeWidth={2.5} />
        <span className={styles.btnText}>New note</span>
      </button>

      <div className={styles.searchWrapper}>
        <Search size={14} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className={styles.divider} />

      <button className={styles.iconBtn} onClick={onFitView} title="Fit to screen">
        <Maximize size={15} />
      </button>

      <div className={styles.spacer} />

      {message && <span className={styles.flash}>{message}</span>}

      <button className={styles.iconBtn} onClick={handleExport} title="Export JSON">
        <Download size={15} />
      </button>

      <button className={styles.iconBtn} onClick={handleImportClick} disabled={importing} title="Import JSON">
        <Upload size={15} />
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className={styles.hiddenInput} onChange={handleFileChange} />

      <div className={styles.settingsWrapper}>
        <button
          className={`${styles.iconBtn} ${showSettings ? styles.iconBtnActive : ''}`}
          onClick={() => setShowSettings(v => !v)}
          title="Settings"
        >
          <Settings size={15} />
        </button>

        {showSettings && (
          <div className={styles.settingsPopover}>
            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle}>Gemini API Key</span>
              <button className={styles.closeBtn} onClick={() => setShowSettings(false)}>
                <X size={14} />
              </button>
            </div>
            <p className={styles.settingsHint}>
              Get your key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className={styles.link}>aistudio.google.com</a>. Stored locally.
            </p>
            <div className={styles.keyRow}>
              <input
                type={showKey ? 'text' : 'password'}
                className={styles.keyInput}
                placeholder="AIza…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
              />
              <button className={styles.visibilityBtn} onClick={() => setShowKey(v => !v)}>
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button className={styles.saveBtn} onClick={saveApiKey}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
}
