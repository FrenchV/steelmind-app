// Core data models for the Soccer Mindset Coach app

export interface MoodEntry {
  id: string;
  date: string; // ISO date string
  rating: number; // 1-5 scale (1 = Very Anxious, 5 = Peak Flow)
  notes?: string;
  gameType?: 'practice' | 'game' | 'training';
  createdAt: string; // ISO timestamp
}

export interface ExerciseSession {
  id: string;
  exerciseType: 'breathing' | 'visualization' | 'heartrate';
  duration: number; // in seconds
  completed: boolean;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  notes?: string;
}

export interface RoutineStep {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "3 minutes"
  icon: string; // icon name
  color: string; // hex color
  details: string[];
  estimatedDuration: number; // in seconds
}

export interface RoutineSession {
  id: string;
  date: string; // ISO date string
  steps: RoutineStep[];
  completedSteps: string[]; // array of step IDs
  totalDuration: number; // in seconds
  completed: boolean;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  reminderTime?: string; // HH:MM format
  preferredExerciseDuration: number; // in minutes
  onboardingCompleted: boolean;
}

export interface AppState {
  moodEntries: MoodEntry[];
  exerciseSessions: ExerciseSession[];
  routineSessions: RoutineSession[];
  userPreferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

// Utility types
export type MoodRating = 1 | 2 | 3 | 4 | 5;
export type ExerciseType = 'breathing' | 'visualization' | 'heartrate';
export type GameType = 'practice' | 'game' | 'training';

// Default values
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  notificationsEnabled: true,
  preferredExerciseDuration: 5,
  onboardingCompleted: false,
};

export const DEFAULT_ROUTINE_STEPS: RoutineStep[] = [
  {
    id: 'mental-prep',
    title: 'Mental Preparation',
    description: 'Set your mindset for success',
    duration: '3 minutes',
    icon: 'Brain',
    color: '#8B5CF6',
    estimatedDuration: 180,
    details: [
      'Take 5 deep breaths to center yourself',
      'Remind yourself: "I belong here"',
      'Visualize yourself playing with confidence',
      'Set one simple intention for the game'
    ]
  },
  {
    id: 'visualization',
    title: 'Success Visualization',
    description: 'See your best performance',
    duration: '5 minutes',
    icon: 'Target',
    color: '#16A34A',
    estimatedDuration: 300,
    details: [
      'Close your eyes and picture the field',
      'See yourself making accurate passes',
      'Visualize successful defensive plays',
      'Imagine teammates celebrating with you',
      'Feel the joy of playing your best game'
    ]
  },
  {
    id: 'breathing',
    title: 'Calming Breath Work',
    description: 'Regulate your nervous system',
    duration: '4 minutes',
    icon: 'Heart',
    color: '#EF4444',
    estimatedDuration: 240,
    details: [
      'Use the 4-7-8 breathing technique',
      'Inhale for 4 counts through your nose',
      'Hold for 7 counts',
      'Exhale for 8 counts through your mouth',
      'Repeat 4-6 cycles'
    ]
  },
  {
    id: 'affirmations',
    title: 'Power Affirmations',
    description: 'Build unshakeable confidence',
    duration: '2 minutes',
    icon: 'Zap',
    color: '#F59E0B',
    estimatedDuration: 120,
    details: [
      'Repeat each affirmation 3 times:',
      '"I am prepared and confident"',
      '"I trust my skills and training"',
      '"I play with joy and focus"',
      '"I am exactly where I need to be"'
    ]
  }
];