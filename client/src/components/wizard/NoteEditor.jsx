import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './NoteEditor.module.css';

export default function NoteEditor({ value, onSave, placeholder }) {
  const [draft, setDraft] = useState(value || '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(value || '');
    setIsDirty(false);
  }, [value]);

  const handleChange = (e) => {
    setDraft(e.target.value);
    setIsDirty(e.target.value !== (value || ''));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.noteEditor}>
      <label className={styles.label}>Notes:</label>
      <textarea
        className={styles.textarea}
        value={draft}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
      />
      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={styles.saveButton}
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
        {isDirty && <span className={styles.unsavedIndicator}>Unsaved changes</span>}
      </div>
    </div>
  );
}

NoteEditor.propTypes = {
  value: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
