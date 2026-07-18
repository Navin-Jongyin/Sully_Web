import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { type OnlineTestRecord, resolveTimeLimitMinutes } from './types';
import './OnlineTestPlayer.css';
import { useAuth } from '../hooks/useAuth';
import { completeTestAttempt, hasTestAttempt } from '../lib/online-test-attempts';

interface OnlineTestPlayerProps {
  test: OnlineTestRecord;
  onExit: () => void;
}

export const OnlineTestPlayer: React.FC<OnlineTestPlayerProps> = ({ test, onExit }) => {
  const { user } = useAuth();
  // Parse questions from test.data dynamically supporting both array and object formats
  const questions = useMemo<any[]>(() => {
    if (Array.isArray(test.data)) {
      return test.data;
    }
    if (test.data && Array.isArray(test.data.questions)) {
      return test.data.questions;
    }
    return [];
  }, [test.data]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => resolveTimeLimitMinutes(test) * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [attemptBlocked, setAttemptBlocked] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    hasTestAttempt(user.email, test.id).then((exists) => {
      if (!exists) {
        setAttemptBlocked(true);
      }
    });
  }, [user?.email, test.id]);

  const handleConfirmSubmit = () => {
    setIsCompleted(true);
    setShowSubmitModal(false);
  };

  const handleConfirmQuit = () => {
    setShowQuitModal(false);
    onExit();
  };

  const currentQuestion = questions[currentIdx];

  // Countdown timer effect
  useEffect(() => {
    if (isCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto submit on expiration
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, timeLeft, showQuitModal, showSubmitModal]);

  useEffect(() => {
    if (!isCompleted || !user?.email) return;

    let finalScore = 0;
    questions.forEach((q: any) => {
      const qNum = q.number || q.id;
      if (answers[qNum] === q.answer) {
        finalScore++;
      }
    });

    completeTestAttempt(user.email, test.id, finalScore, questions.length).catch(console.error);
  }, [isCompleted, user?.email, test.id, questions, answers]);

  // Prevent accidental exits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isCompleted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCompleted]);

  if (attemptBlocked) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h3>Test unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          You have already taken this test or cannot start a new attempt.
        </p>
        <button type="button" onClick={onExit} className="button button-secondary" style={{ marginTop: '1.5rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h3>Empty Exam</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>This practice test does not contain any questions in its JSON payload.</p>
        <button type="button" onClick={onExit} className="button button-secondary" style={{ marginTop: '1.5rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getQuestionNumber = (q: any, idx: number) => {
    return typeof q.number === 'number' ? q.number : idx + 1;
  };

  const getQuestionText = (q: any) => {
    return q.question || q.prompt || '';
  };

  // Normalise options format to { key: string, text: string }[]
  const getOptionsList = (q: any) => {
    if (!q.options) return [];
    if (Array.isArray(q.options)) {
      return q.options.map((opt: any, idx: number) => {
        const keys = ['A', 'B', 'C', 'D'];
        return { key: keys[idx] || String(idx), text: String(opt) };
      });
    }
    if (typeof q.options === 'object') {
      return Object.entries(q.options).map(([key, val]) => ({
        key,
        text: String(val),
      }));
    }
    return [];
  };

  const handleSelectOption = (optionKey: string) => {
    const qNum = getQuestionNumber(currentQuestion, currentIdx);
    setAnswers((prev) => ({ ...prev, [qNum]: optionKey }));
  };

  const handleToggleFlag = () => {
    const qNum = getQuestionNumber(currentQuestion, currentIdx);
    setFlagged((prev) => ({ ...prev, [qNum]: !prev[qNum] }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = (auto = false) => {
    if (auto) {
      setIsCompleted(true);
      setShowSubmitModal(false);
    } else {
      setShowSubmitModal(true);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Compute results
  const scoreResults = () => {
    let correctCount = 0;
    const reviewData = questions.map((q, idx) => {
      const qNum = getQuestionNumber(q, idx);
      const userAns = answers[qNum] || '';
      const correctAns = String(q.answer || '').toUpperCase();
      const isCorrect = userAns.toUpperCase() === correctAns;
      if (isCorrect) correctCount++;

      return {
        qNum,
        text: getQuestionText(q),
        options: getOptionsList(q),
        userAns,
        correctAns,
        isCorrect,
      };
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    return {
      correctCount,
      percent,
      reviewData,
    };
  };

  if (isCompleted) {
    const { correctCount, percent, reviewData } = scoreResults();

    return (
      <div style={{ padding: '2rem 1rem', width: '100%', maxWidth: '960px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div className="ot-scorecard">
          <div className="ot-score-circle">
            <span className="ot-score-percent">{percent}%</span>
            <span className="ot-score-fraction">
              {correctCount} / {questions.length} Correct
            </span>
          </div>

          <h2>Exam Completed!</h2>
          <p className="ot-scorecard-desc">
            You have successfully completed the <strong>{test.title}</strong> exam under the {test.category} section. Review your question breakdown below.
          </p>

          <button type="button" onClick={onExit} className="button button-primary">
            Back to Dashboard
          </button>
        </div>

        <h3 className="ot-review-heading">Review Question Breakdown</h3>
        <div className="ot-review-list">
          {reviewData.map((review, i) => (
            <div key={i} className="ot-review-item">
              <div className={`ot-review-status-badge ${review.isCorrect ? 'correct' : 'incorrect'}`}>
                {review.isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
              </div>
              <div className="ot-review-item-content">
                <p className="ot-review-item-qtext">
                  Question {review.qNum}: {review.text}
                </p>
                <div className="ot-review-answers-grid">
                  <div className={`ot-review-answer-box ${review.isCorrect ? 'correct-ans' : ''}`}>
                    <span className="ot-review-answer-label">Your Answer</span>
                    <span className="ot-review-answer-val">
                      {review.userAns ? `${review.userAns}. ${review.options.find((o: any) => o.key === review.userAns)?.text || ''}` : 'No answer provided'}
                    </span>
                  </div>
                  {!review.isCorrect && (
                    <div className="ot-review-answer-box correct-ans">
                      <span className="ot-review-answer-label">Correct Answer</span>
                      <span className="ot-review-answer-val">
                        {review.correctAns}. {review.options.find((o: any) => o.key === review.correctAns)?.text || ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQNum = getQuestionNumber(currentQuestion, currentIdx);
  const isWarningTime = timeLeft < 300; // < 5 minutes

  return (
    <div className="ot-player-layout">
      {/* Sidebar navigation */}
      <aside className={`ot-player-sidebar ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
        <div className="ot-sidebar-inner">
          <div className="ot-sidebar-head">
            <h2>Questions</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {Object.keys(answers).length} / {questions.length} Answered
            </span>
          </div>

          <div className="ot-tracking-grid">
            {questions.map((q, idx) => {
              const qNum = getQuestionNumber(q, idx);
              const isAnswered = !!answers[qNum];
              const isCurrent = currentIdx === idx;
              const isQFlagged = !!flagged[qNum];

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`ot-grid-item ${isAnswered ? 'is-answered' : ''} ${isCurrent ? 'is-current' : ''} ${isQFlagged ? 'is-flagged' : ''}`}
                >
                  {qNum}
                </button>
              );
            })}
          </div>

          <div className="ot-sidebar-legend">
            <div className="ot-legend-item">
              <span className="ot-legend-dot current" />
              <span>Current</span>
            </div>
            <div className="ot-legend-item">
              <span className="ot-legend-dot answered" />
              <span>Answered</span>
            </div>
            <div className="ot-legend-item">
              <span className="ot-legend-dot flagged" />
              <span>Flagged</span>
            </div>
            <div className="ot-legend-item">
              <span className="ot-legend-dot" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Collapse sidebar button */}
      <button
        type="button"
        className="ot-sidebar-toggle"
        onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        title={isSidebarCollapsed ? 'Expand Question Tracker' : 'Collapse Question Tracker'}
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Main viewport */}
      <main className="ot-player-main">
        <header className="ot-player-header">
          <div className="ot-player-title-box">
            <h1>{test.title}</h1>
            <p>{test.category}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className={`ot-player-timer ${isWarningTime ? 'is-warning' : ''}`} title="Time Remaining">
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button type="button" onClick={() => handleSubmit(false)} className="button button-purple" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
              Finish Exam
            </button>
          </div>
        </header>

        <div className="ot-player-content-wrapper">
          <div className="ot-player-content">
            <article className="ot-question-card">
              <div className="ot-question-meta">
                <span className="ot-question-number">Question {currentQNum} of {questions.length}</span>
                <button
                  type="button"
                  onClick={handleToggleFlag}
                  className={`ot-flag-btn ${flagged[currentQNum] ? 'is-active' : ''}`}
                >
                  <Star size={14} fill={flagged[currentQNum] ? 'currentColor' : 'none'} />
                  <span>Flag for Review</span>
                </button>
              </div>

              <h2 className="ot-question-text">{getQuestionText(currentQuestion)}</h2>

              <div className="ot-options-list">
                {getOptionsList(currentQuestion).map((option: any) => {
                  const isSelected = answers[currentQNum] === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelectOption(option.key)}
                      className={`ot-option-button ${isSelected ? 'is-selected' : ''}`}
                    >
                      <span className="ot-option-badge">{option.key}</span>
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </article>

            {/* Navigation buttons */}
            <div className="ot-player-nav">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="button button-secondary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', opacity: currentIdx === 0 ? 0.5 : 1, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <button
                type="button"
                onClick={handleExitPrompt}
                className="button button-secondary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', border: '1px dashed #ef4444', color: '#ef4444' }}
              >
                Quit Exam
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIdx === questions.length - 1}
                className="button button-secondary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', opacity: currentIdx === questions.length - 1 ? 0.5 : 1, cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {showSubmitModal && (
        <div className="ot-modal-overlay">
          <div className="ot-modal-content">
            <h3>Finish Exam?</h3>
            <p>Are you sure you want to finish and submit your exam? You will not be able to change your answers.</p>
            <div className="ot-modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-purple"
                onClick={handleConfirmSubmit}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuitModal && (
        <div className="ot-modal-overlay">
          <div className="ot-modal-content">
            <h3>Quit Exam?</h3>
            <p>Are you sure you want to quit the exam? Your current progress will not be saved.</p>
            <div className="ot-modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowQuitModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={handleConfirmQuit}
              >
                Quit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleExitPrompt() {
    setShowQuitModal(true);
  }
};
