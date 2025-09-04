import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '@/services/storage';
import { MoodEntry, ExerciseSession, RoutineSession } from '@/types';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
}));

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mood Entries', () => {
    it('should get empty array when no mood entries exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const entries = await storageService.getMoodEntries();
      
      expect(entries).toEqual([]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('mood_entries');
    });

    it('should add mood entry successfully', async () => {
      const mockEntry: MoodEntry = {
        id: 'test-id',
        date: '2025-01-01',
        rating: 4,
        createdAt: '2025-01-01T10:00:00.000Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue('[]');
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await storageService.addMoodEntry(mockEntry);

      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'mood_entries',
        JSON.stringify([mockEntry])
      );
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const entries = await storageService.getMoodEntries();

      expect(entries).toEqual([]);
    });

    it('should replace existing entry for same date', async () => {
      const existingEntry: MoodEntry = {
        id: 'existing-id',
        date: '2025-01-01',
        rating: 3,
        createdAt: '2025-01-01T09:00:00.000Z',
      };

      const newEntry: MoodEntry = {
        id: 'new-id',
        date: '2025-01-01',
        rating: 4,
        createdAt: '2025-01-01T10:00:00.000Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingEntry]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await storageService.addMoodEntry(newEntry);

      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'mood_entries',
        JSON.stringify([newEntry])
      );
    });
  });

  describe('Exercise Sessions', () => {
    it('should add exercise session successfully', async () => {
      const mockSession: ExerciseSession = {
        id: 'test-session',
        exerciseType: 'breathing',
        duration: 180,
        completed: true,
        startTime: '2025-01-01T10:00:00.000Z',
        endTime: '2025-01-01T10:03:00.000Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue('[]');
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await storageService.addExerciseSession(mockSession);

      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'exercise_sessions',
        JSON.stringify([mockSession])
      );
    });

    it('should update exercise session successfully', async () => {
      const existingSession: ExerciseSession = {
        id: 'test-session',
        exerciseType: 'breathing',
        duration: 0,
        completed: false,
        startTime: '2025-01-01T10:00:00.000Z',
      };

      const updates = {
        duration: 180,
        completed: true,
        endTime: '2025-01-01T10:03:00.000Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingSession]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await storageService.updateExerciseSession('test-session', updates);

      expect(result).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate mood entry correctly', async () => {
      const validEntry: MoodEntry = {
        id: 'test-id',
        date: '2025-01-01',
        rating: 4,
        createdAt: '2025-01-01T10:00:00.000Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([validEntry]));

      const isValid = await storageService.validateDataIntegrity();

      expect(isValid).toBe(true);
    });

    it('should detect invalid mood entry', async () => {
      const invalidEntry = {
        id: 'test-id',
        date: '2025-01-01',
        rating: 10, // Invalid rating
        createdAt: '2025-01-01T10:00:00.000Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([invalidEntry]));

      const isValid = await storageService.validateDataIntegrity();

      expect(isValid).toBe(false);
    });
  });

  describe('Data Export', () => {
    it('should export all data successfully', async () => {
      const mockData = {
        moodEntries: [],
        exerciseSessions: [],
        routineSessions: [],
        userPreferences: { notificationsEnabled: true, preferredExerciseDuration: 5, onboardingCompleted: false },
      };

      mockAsyncStorage.getItem.mockResolvedValue('[]');

      const exportedData = await storageService.exportData();

      expect(exportedData).toBeTruthy();
      expect(JSON.parse(exportedData!)).toMatchObject(mockData);
    });
  });
});