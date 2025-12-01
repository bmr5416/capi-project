import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClient } from '../hooks/useClients';
import { useMinLoadingTime } from '../hooks/useMinLoadingTime';
import { progressApi, docsApi, notesApi } from '../services/api';
import { getPlatformById } from '../data/platforms';
import { getWizardSteps, PHASES } from '../data/wizardSteps';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import LoadingAnimation from '../components/common/LoadingAnimation';
import ChecklistItem from '../components/wizard/ChecklistItem';
import NoteEditor from '../components/wizard/NoteEditor';
import styles from './Wizard.module.css';
import anim from '../styles/animations.module.css';

export default function Wizard() {
  const { clientId, platform } = useParams();
  const navigate = useNavigate();
  const { client, loading, error, refetch } = useClient(clientId);
  const showLoading = useMinLoadingTime(loading);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [saving, setSaving] = useState(false);

  // Interactive checklist state
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [itemProgress, setItemProgress] = useState({});
  const [checklistContent, setChecklistContent] = useState({});
  const [notes, setNotes] = useState({});
  const [stepNotes, setStepNotes] = useState({});
  const [showWarning, setShowWarning] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const platformInfo = getPlatformById(platform);
  const steps = useMemo(() => getWizardSteps(platform), [platform]);
  const currentStep = steps[currentStepIndex];

  // Load completed steps from progress
  useEffect(() => {
    if (client?.progress) {
      const completed = new Set(
        client.progress
          .filter((p) => p.status === 'completed' && (p.platform === platform || p.platform === 'core'))
          .map((p) => p.stepId)
      );
      setCompletedSteps(completed);

      // Find first incomplete step
      const firstIncomplete = steps.findIndex((s) => !completed.has(s.id));
      if (firstIncomplete > 0) {
        setCurrentStepIndex(firstIncomplete);
      }
    }
  }, [client, platform, steps]);

  // Load checklist content and item progress when step changes
  useEffect(() => {
    if (!currentStep) return;

    let isMounted = true;

    const loadStepData = async () => {
      try {
        // Load checklist content (instructions)
        const contentRes = await docsApi.getChecklistContent(currentStep.id);
        if (!isMounted) return;
        setChecklistContent((prev) => ({
          ...prev,
          [currentStep.id]: contentRes.items || [],
        }));

        // Load item progress
        const stepPlatform = currentStep.id.startsWith('core.') ? 'core' : platform;
        const progressRes = await progressApi.getItemProgress(clientId, stepPlatform, currentStep.id);
        if (!isMounted) return;
        const progressMap = {};
        (progressRes.items || []).forEach((item) => {
          progressMap[item.itemIndex] = item.status === 'completed';
        });
        setItemProgress((prev) => ({
          ...prev,
          [currentStep.id]: progressMap,
        }));

        // Load notes
        const notesRes = await notesApi.get(clientId, stepPlatform, currentStep.id);
        if (!isMounted) return;
        const itemNotesMap = {};
        let stepNote = '';
        (notesRes.notes || notesRes || []).forEach((note) => {
          if (note.itemIndex !== null && note.itemIndex !== undefined) {
            itemNotesMap[note.itemIndex] = note.note;
          } else {
            stepNote = note.note;
          }
        });
        setNotes((prev) => ({
          ...prev,
          [currentStep.id]: itemNotesMap,
        }));
        setStepNotes((prev) => ({
          ...prev,
          [currentStep.id]: stepNote,
        }));
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load step data:', err);
      }
    };

    loadStepData();

    return () => {
      isMounted = false;
    };
  }, [currentStep, clientId, platform]);

  // Get content for current step items
  const currentContent = useMemo(
    () => checklistContent[currentStep?.id] || [],
    [checklistContent, currentStep?.id]
  );
  const currentItemProgress = useMemo(
    () => itemProgress[currentStep?.id] || {},
    [itemProgress, currentStep?.id]
  );
  const currentNotes = useMemo(
    () => notes[currentStep?.id] || {},
    [notes, currentStep?.id]
  );
  const currentStepNote = useMemo(
    () => stepNotes[currentStep?.id] || '',
    [stepNotes, currentStep?.id]
  );

  // Count unchecked items for warning
  const getUncheckedCount = useCallback(() => {
    const total = currentStep?.checklist?.length || 0;
    const checked = Object.values(currentItemProgress).filter(Boolean).length;
    return total - checked;
  }, [currentStep?.checklist?.length, currentItemProgress]);

  const handleToggleExpand = useCallback((itemIndex) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemIndex)) {
        next.delete(itemIndex);
      } else {
        next.add(itemIndex);
      }
      return next;
    });
  }, []);

  const handleToggleItemComplete = useCallback(async (itemIndex, checked) => {
    setSaving(true);
    setSaveError(null);
    try {
      const stepPlatform = currentStep.id.startsWith('core.') ? 'core' : platform;

      if (checked) {
        await progressApi.completeItem(clientId, stepPlatform, currentStep.id, itemIndex);
      } else {
        await progressApi.uncompleteItem(clientId, stepPlatform, currentStep.id, itemIndex);
      }

      setItemProgress((prev) => ({
        ...prev,
        [currentStep.id]: {
          ...(prev[currentStep.id] || {}),
          [itemIndex]: checked,
        },
      }));
    } catch (err) {
      console.error('Failed to update item:', err);
      setSaveError('Failed to save progress. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [clientId, currentStep, platform]);

  const handleSaveItemNote = useCallback(async (itemIndex, noteContent) => {
    setSaveError(null);
    try {
      const stepPlatform = currentStep.id.startsWith('core.') ? 'core' : platform;
      await notesApi.save(clientId, stepPlatform, currentStep.id, noteContent, itemIndex);
      setNotes((prev) => ({
        ...prev,
        [currentStep.id]: {
          ...(prev[currentStep.id] || {}),
          [itemIndex]: noteContent,
        },
      }));
    } catch (err) {
      console.error('Failed to save note:', err);
      setSaveError('Failed to save note. Please try again.');
    }
  }, [clientId, currentStep, platform]);

  const handleSaveStepNote = useCallback(async (noteContent) => {
    setSaveError(null);
    try {
      const stepPlatform = currentStep.id.startsWith('core.') ? 'core' : platform;
      await notesApi.save(clientId, stepPlatform, currentStep.id, noteContent, null);
      setStepNotes((prev) => ({
        ...prev,
        [currentStep.id]: noteContent,
      }));
    } catch (err) {
      console.error('Failed to save step note:', err);
      setSaveError('Failed to save step note. Please try again.');
    }
  }, [clientId, currentStep, platform]);

  const markStepComplete = useCallback(async (stepId, checked) => {
    setSaving(true);
    setSaveError(null);
    try {
      const stepPlatform = stepId.startsWith('core.') ? 'core' : platform;
      if (checked) {
        await progressApi.completeStep(clientId, stepPlatform, stepId);
        setCompletedSteps((prev) => new Set([...prev, stepId]));
      } else {
        await progressApi.uncompleteStep(clientId, stepPlatform, stepId);
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.delete(stepId);
          return next;
        });
      }
      await refetch();
    } catch (err) {
      console.error('Failed to update step:', err);
      setSaveError('Failed to update step. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [clientId, platform, refetch]);

  const handleToggleStep = useCallback(async (stepId, checked) => {
    // Check for uncompleted items
    const uncheckedCount = getUncheckedCount();

    if (checked && uncheckedCount > 0) {
      setShowWarning({
        message: `${uncheckedCount} checklist item(s) are not yet completed. Mark step as complete anyway?`,
        onConfirm: () => {
          setShowWarning(null);
          markStepComplete(stepId, true);
        },
        onCancel: () => setShowWarning(null),
      });
      return;
    }

    await markStepComplete(stepId, checked);
  }, [getUncheckedCount, markStepComplete]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setExpandedItems(new Set()); // Reset expanded items
    }
  }, [currentStepIndex, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setExpandedItems(new Set()); // Reset expanded items
    }
  }, [currentStepIndex]);

  const handleComplete = useCallback(() => {
    navigate(`/clients/${clientId}`);
  }, [navigate, clientId]);

  const isCurrentStepComplete = completedSteps.has(currentStep?.id);
  const allStepsComplete = steps.every((s) => completedSteps.has(s.id));
  const progress = (completedSteps.size / steps.length) * 100;

  if (showLoading) {
    return <LoadingAnimation />;
  }

  if (error || !client) {
    return <div className={styles.error}>Error loading wizard</div>;
  }

  return (
    <div className={styles.container}>
      {/* Warning Modal */}
      {showWarning && (
        <div className={styles.warningOverlay}>
          <div className={styles.warningModal}>
            <p>{showWarning.message}</p>
            <div className={styles.warningActions}>
              <Button variant="ghost" onClick={showWarning.onCancel}>
                Cancel
              </Button>
              <Button onClick={showWarning.onConfirm}>
                Mark Complete Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className={`${styles.header} ${anim.slideUp}`}>
        <Link to={`/clients/${clientId}`} className={styles.backLink}>
          ← Back to {client.name}
        </Link>
        <div className={styles.headerInfo}>
          <h1>
            {platformInfo?.logo && (
              <img
                src={platformInfo.logo}
                alt={platformInfo.name}
                className={styles.platformIcon}
              />
            )}
            {platformInfo?.name} Setup
          </h1>
          <div className={styles.progressInfo}>
            {Math.round(progress)}% complete
          </div>
        </div>
      </header>

      <div className={`${styles.wizardLayout} ${anim.slideUpDelay1}`}>
        <aside className={styles.sidebar}>
          <nav className={styles.stepNav}>
            {PHASES.map((phase) => {
              const phaseSteps = steps.filter((s) => s.phase === phase.id);
              const phaseComplete = phaseSteps.every((s) => completedSteps.has(s.id));

              return (
                <div key={phase.id} className={styles.phaseGroup}>
                  <div className={`${styles.phaseHeader} ${phaseComplete ? styles.complete : ''}`}>
                    <span className={styles.phaseNumber}>
                      {phaseComplete ? '✓' : phase.id}
                    </span>
                    <div>
                      <div className={styles.phaseName}>{phase.name}</div>
                      <div className={styles.phaseDesc}>{phase.description}</div>
                    </div>
                  </div>
                  <div className={styles.phaseSteps}>
                    {phaseSteps.map((step) => {
                      const stepIndex = steps.indexOf(step);
                      const isActive = stepIndex === currentStepIndex;
                      const isComplete = completedSteps.has(step.id);

                      return (
                        <button
                          key={step.id}
                          className={`${styles.stepItem} ${isActive ? styles.active : ''} ${isComplete ? styles.complete : ''}`}
                          onClick={() => {
                            setCurrentStepIndex(stepIndex);
                            setExpandedItems(new Set());
                          }}
                        >
                          <span className={styles.stepDot}>
                            {isComplete ? '✓' : ''}
                          </span>
                          <span className={styles.stepTitle}>{step.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        <main className={styles.main}>
          {saveError && (
            <div className={styles.saveError}>
              {saveError}
              <button
                type="button"
                className={styles.dismissError}
                onClick={() => setSaveError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          <Card className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <span className={styles.stepPhase}>Phase {currentStep.phase}</span>
              <h2>{currentStep.title}</h2>
              <p>{currentStep.description}</p>
            </div>

            <div className={styles.stepContent}>
              <h3>Checklist</h3>
              <ul className={styles.checklist}>
                {currentStep.checklist.map((item, idx) => {
                  const content = currentContent.find((c) => c.itemIndex === idx) || {};
                  return (
                    <ChecklistItem
                      key={`${currentStep.id}-item-${idx}`}
                      itemIndex={idx}
                      title={content.title || item}
                      instruction={content.instruction}
                      links={content.links || []}
                      isCompleted={!!currentItemProgress[idx]}
                      isExpanded={expandedItems.has(idx)}
                      note={currentNotes[idx] || ''}
                      onToggleComplete={handleToggleItemComplete}
                      onToggleExpand={handleToggleExpand}
                      onSaveNote={handleSaveItemNote}
                    />
                  );
                })}
              </ul>

              {currentStep.docLink && (
                <div className={styles.docLink}>
                  <a href={currentStep.docLink} target="_blank" rel="noopener noreferrer">
                    <Icon name="book" size={16} className={styles.docIcon} />
                    View Documentation
                  </a>
                </div>
              )}

              <div className={styles.stepNotesSection}>
                <h4>Step Notes</h4>
                <NoteEditor
                  value={currentStepNote}
                  onSave={handleSaveStepNote}
                  placeholder="Add notes for this step..."
                />
              </div>

              <div className={styles.markComplete}>
                <label className={styles.markCompleteLabel}>
                  <input
                    type="checkbox"
                    checked={isCurrentStepComplete}
                    onChange={(e) => handleToggleStep(currentStep.id, e.target.checked)}
                    disabled={saving}
                  />
                  <span>Mark this step as complete</span>
                </label>
              </div>
            </div>
          </Card>

          <div className={styles.navigation}>
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              ← Previous
            </Button>

            {currentStepIndex === steps.length - 1 ? (
              <Button onClick={handleComplete} disabled={!allStepsComplete}>
                {allStepsComplete ? 'Complete Setup' : 'Complete All Steps'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next →
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
