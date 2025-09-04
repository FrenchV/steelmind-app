import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  MoodEntry, 
  ExerciseSession, 
  RoutineSession, 
  UserPreferences,
  DEFAULT_USER_PREFERENCES 
} from '@/types';
import { BatchProcessor } from '@/utils/performance';

// Storage keys
const STORAGE_KEYS = {
  MOOD_ENTRIES: 'mood_entries',
  EXERCISE_SESSIONS: 'exercise_sessions',
  ROUTINE_SESSIONS: 'routine_sessions',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Generic storage operations with error handling
class StorageService {
  private batchProcessor: BatchProcessor<() => Promise<void>>;

  constructor() {
    this.batchProcessor = new BatchProcessor(
      async (operations) => {
        for (const operation of operations) {
          await operation();
        }
      },
      5 // Batch size
    );
  }

  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return defaultValue;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  }

  private async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  }

  // Mood Entries
  async getMoodEntries(): Promise<MoodEntry[]> {
    return this.getItem(STORAGE_KEYS.MOOD_ENTRIES, []);
  }

  async saveMoodEntries(entries: MoodEntry[]): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.MOOD_ENTRIES, entries);
  }

  async addMoodEntry(entry: MoodEntry): Promise<boolean> {
    // Use batch processing for better performance
    return new Promise((resolve) => {
      this.batchProcessor.add(async () => {
        const entries = await this.getMoodEntries();
        
        // Remove existing entry for the same date if it exists
        const filteredEntries = entries.filter(e => e.date !== entry.date);
        
        // Add new entry and sort by date (newest first)
        const updatedEntries = [entry, ...filteredEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const success = await this.saveMoodEntries(updatedEntries);
        resolve(success);
      });
    });
  }

  async deleteMoodEntry(entryId: string): Promise<boolean> {
    const entries = await this.getMoodEntries();
    const filteredEntries = entries.filter(e => e.id !== entryId);
    return this.saveMoodEntries(filteredEntries);
  }

  // Exercise Sessions
  async getExerciseSessions(): Promise<ExerciseSession[]> {
    return this.getItem(STORAGE_KEYS.EXERCISE_SESSIONS, []);
  }

  async saveExerciseSessions(sessions: ExerciseSession[]): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.EXERCISE_SESSIONS, sessions);
  }

  async addExerciseSession(session: ExerciseSession): Promise<boolean> {
    const sessions = await this.getExerciseSessions();
    const updatedSessions = [session, ...sessions].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    return this.saveExerciseSessions(updatedSessions);
  }

  async updateExerciseSession(sessionId: string, updates: Partial<ExerciseSession>): Promise<boolean> {
    const sessions = await this.getExerciseSessions();
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    );
    return this.saveExerciseSessions(updatedSessions);
  }

  // Routine Sessions
  async getRoutineSessions(): Promise<RoutineSession[]> {
    return this.getItem(STORAGE_KEYS.ROUTINE_SESSIONS, []);
  }

  async saveRoutineSessions(sessions: RoutineSession[]): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.ROUTINE_SESSIONS, sessions);
  }

  async addRoutineSession(session: RoutineSession): Promise<boolean> {
    const sessions = await this.getRoutineSessions();
    const updatedSessions = [session, ...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return this.saveRoutineSessions(updatedSessions);
  }

  async updateRoutineSession(sessionId: string, updates: Partial<RoutineSession>): Promise<boolean> {
    const sessions = await this.getRoutineSessions();
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    );
    return this.saveRoutineSessions(updatedSessions);
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    return this.getItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES);
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<boolean> {
    const currentPreferences = await this.getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...updates };
    return this.saveUserPreferences(updatedPreferences);
  }

  // Utility methods
  async clearAllData(): Promise<boolean> {
    try {
      await Promise.all([
        this.removeItem(STORAGE_KEYS.MOOD_ENTRIES),
        this.removeItem(STORAGE_KEYS.EXERCISE_SESSIONS),
        this.removeItem(STORAGE_KEYS.ROUTINE_SESSIONS),
        this.removeItem(STORAGE_KEYS.USER_PREFERENCES),
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Check if data exists locally (offline support)
  async hasLocalData(): Promise<boolean> {
    try {
      const [moodEntries, exerciseSessions, routineSessions] = await Promise.all([
        this.getMoodEntries(),
        this.getExerciseSessions(),
        this.getRoutineSessions(),
      ]);

      return moodEntries.length > 0 || exerciseSessions.length > 0 || routineSessions.length > 0;
    } catch (error) {
      console.error('Error checking local data:', error);
      return false;
    }
  }

  // Validate data integrity
  async validateDataIntegrity(): Promise<boolean> {
    try {
      const [moodEntries, exerciseSessions, routineSessions] = await Promise.all([
        this.getMoodEntries(),
        this.getExerciseSessions(),
        this.getRoutineSessions(),
      ]);

      // Check if data is valid
      const validMoods = moodEntries.every(entry => this.validateMoodEntry(entry));
      const validExercises = exerciseSessions.every(session => this.validateExerciseSession(session));
      const validRoutines = routineSessions.every(session => this.validateRoutineSession(session));

      return validMoods && validExercises && validRoutines;
    } catch (error) {
      console.error('Error validating data integrity:', error);
      return false;
    }
  }

  async exportData(): Promise<string | null> {
    try {
      const [moodEntries, exerciseSessions, routineSessions, userPreferences] = await Promise.all([
        this.getMoodEntries(),
        this.getExerciseSessions(),
        this.getRoutineSessions(),
        this.getUserPreferences(),
      ]);

      const exportData = {
        moodEntries,
        exerciseSessions,
        routineSessions,
        userPreferences,
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Data validation helpers
  private validateMoodEntry(entry: any): entry is MoodEntry {
    return (
      typeof entry.id === 'string' &&
      typeof entry.date === 'string' &&
      typeof entry.rating === 'number' &&
      entry.rating >= 1 &&
      entry.rating <= 5 &&
      typeof entry.createdAt === 'string'
    );
  }

  private validateExerciseSession(session: any): session is ExerciseSession {
    return (
      typeof session.id === 'string' &&
      ['breathing', 'visualization', 'heartrate'].includes(session.exerciseType) &&
      typeof session.duration === 'number' &&
      typeof session.completed === 'boolean' &&
      typeof session.startTime === 'string'
    );
  }

  private validateRoutineSession(session: any): session is RoutineSession {
    return (
      typeof session.id === 'string' &&
      typeof session.date === 'string' &&
      Array.isArray(session.steps) &&
      Array.isArray(session.completedSteps) &&
      typeof session.totalDuration === 'number' &&
      typeof session.completed === 'boolean'
    );
  }
}

// Export singleton instance
export const storageService = new StorageService();