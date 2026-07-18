export type OnlineTestAttemptStatus = 'started' | 'completed';

export interface OnlineTestAttempt {
  email: string;
  testId: string;
  uid?: string;
  status: OnlineTestAttemptStatus;
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalQuestions?: number;
}
