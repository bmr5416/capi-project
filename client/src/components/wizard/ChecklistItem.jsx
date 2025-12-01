import { memo } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import NoteEditor from './NoteEditor';
import styles from './ChecklistItem.module.css';

function ChecklistItem({
  itemIndex,
  title,
  instruction,
  links,
  isCompleted,
  isExpanded,
  note,
  onToggleComplete,
  onToggleExpand,
  onSaveNote,
}) {
  return (
    <li className={styles.checkItem}>
      <div className={styles.checkItemHeader}>
        <button
          type="button"
          className={styles.expandButton}
          onClick={() => onToggleExpand(itemIndex)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse item' : 'Expand item'}
        >
          {isExpanded ? '\u25BC' : '\u25B6'}
        </button>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => onToggleComplete(itemIndex, e.target.checked)}
            className={styles.checkbox}
          />
          <span className={isCompleted ? styles.completed : ''}>{title}</span>
        </label>
      </div>

      {isExpanded && (
        <div className={styles.checkItemContent}>
          {instruction && (
            <div className={styles.instruction}>
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {instruction}
              </ReactMarkdown>
            </div>
          )}

          {links && links.length > 0 && (
            <div className={styles.links}>
              <strong>Resources:</strong>
              <ul>
                {links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.title} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <NoteEditor
            value={note}
            onSave={(value) => onSaveNote(itemIndex, value)}
            placeholder="Add notes for this item..."
          />
        </div>
      )}
    </li>
  );
}

ChecklistItem.propTypes = {
  itemIndex: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  instruction: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
  isCompleted: PropTypes.bool,
  isExpanded: PropTypes.bool,
  note: PropTypes.string,
  onToggleComplete: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onSaveNote: PropTypes.func.isRequired,
};

export default memo(ChecklistItem);
