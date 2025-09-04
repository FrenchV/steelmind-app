import { describe, it, expect } from 'vitest';
import { MoodEntry, ExerciseSession, RoutineSession } from '@/types';

// Test utility functions for calculations
describe('Calculation Utilities', () => {
  describe('Mood Statistics', () => {
    it('should calculate average mood correctly', () => {
      const entries: MoodEntry[] = [
        { id: '1', date: '2025-01-01', rating: 4, createdAt: '2025-01-01T10:00:00.000Z' },
        { id: '2', date: '2025-01-02', rating: 2, createdAt: '2025-01-02T10:00:00.000Z' },
        { id: '3', date: '2025-01-03', rating: 5, createdAt: '2025-01-03T10:00:00.000Z' },
      ];

      const average = entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;
      expect(average).toBe(3.67); // (4+2+5)/3 = 3.67 (rounded)
    });

    it('should calculate mood trend correctly', () => {
      const calculateTrend = (entries: MoodEntry[]) => {
        if (entries.length < 6) return 'neutral';
        
        const recent = entries.slice(0, 3);
        const older = entries.slice(3, 6);
        
        const recentAvg = recent.reduce((sum, entry) => sum + entry.rating, 0) / recent.length;
        const olderAvg = older.reduce((sum, entry) => sum + entry.rating, 0) / older.length;
        
        if (recentAvg > olderAvg + 0.3) return 'up';
        if (recentAvg < olderAvg - 0.3) return 'down';
        return 'neutral';
      };

      // Test improving trend
      const improvingEntries: MoodEntry[] = [
        { id: '1', date: '2025-01-06', rating: 5, createdAt: '2025-01-06T10:00:00.000Z' },
        { id: '2', date: '2025-01-05', rating: 4, createdAt: '2025-01-05T10:00:00.000Z' },
        { id: '3', date: '2025-01-04', rating: 4, createdAt: '2025-01-04T10:00:00.000Z' },
        { id: '4', date: '2025-01-03', rating: 2, createdAt: '2025-01-03T10:00:00.000Z' },
        { id: '5', date: '2025-01-02', rating: 2, createdAt: '2025-01-02T10:00:00.000Z' },
        { id: '6', date: '2025-01-01', rating: 3, createdAt: '2025-01-01T10:00:00.000Z' },
      ];

      expect(calculateTrend(improvingEntries)).toBe('up');
    });

    it('should handle empty mood entries', () => {
      const entries: MoodEntry[] = [];
      const average = entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length : 0;
      expect(average).toBe(0);
    });
  });

  describe('Exercise Statistics', () => {
    it('should calculate total exercise duration', () => {
      const sessions: ExerciseSession[] = [
        { id: '1', exerciseType: 'breathing', duration: 180, completed: true, startTime: '2025-01-01T10:00:00.000Z' },
        { id: '2', exerciseType: 'visualization', duration: 300, completed: true, startTime: '2025-01-02T10:00:00.000Z' },
        { id: '3', exerciseType: 'heartrate', duration: 120, completed: false, startTime: '2025-01-03T10:00:00.000Z' },
      ];

      const completedSessions = sessions.filter(session => session.completed);
      const totalDuration = completedSessions.reduce((sum, session) => sum + session.duration, 0);
      
      expect(totalDuration).toBe(480); // 180 + 300
      expect(completedSessions.length).toBe(2);
    });

    it('should calculate completion rate', () => {
      const sessions: ExerciseSession[] = [
        { id: '1', exerciseType: 'breathing', duration: 180, completed: true, startTime: '2025-01-01T10:00:00.000Z' },
        { id: '2', exerciseType: 'visualization', duration: 300, completed: true, startTime: '2025-01-02T10:00:00.000Z' },
        { id: '3', exerciseType: 'heartrate', duration: 0, completed: false, startTime: '2025-01-03T10:00:00.000Z' },
        { id: '4', exerciseType: 'breathing', duration: 0, completed: false, startTime: '2025-01-04T10:00:00.000Z' },
      ];

      const completedSessions = sessions.filter(session => session.completed);
      const completionRate = (completedSessions.length / sessions.length) * 100;
      
      expect(completionRate).toBe(50); // 2/4 = 50%
    });
  });

  describe('Date Utilities', () => {
    it('should calculate date differences correctly', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-01-05');
      
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(4);
    });

    it('should filter entries by date range', () => {
      const entries: MoodEntry[] = [
        { id: '1', date: '2025-01-01', rating: 4, createdAt: '2025-01-01T10:00:00.000Z' },
        { id: '2', date: '2025-01-05', rating: 3, createdAt: '2025-01-05T10:00:00.000Z' },
        { id: '3', date: '2025-01-10', rating: 5, createdAt: '2025-01-10T10:00:00.000Z' },
      ];

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-06');

      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      expect(filteredEntries).toHaveLength(2);
      expect(filteredEntries.map(e => e.id)).toEqual(['1', '2']);
    });
  });
});