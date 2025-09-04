import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { storageService } from '@/services/storage';
import { MoodEntry, MoodRating, GameType } from '@/types';
import { memoize } from '@/utils/performance';

export function useMoodData() {
  const { state, dispatch } = useAppContext();

  // Add a new mood entry
  const addMoodEntry = useCallback(async (
    rating: MoodRating,
    notes?: string,
    gameType?: GameType
  ): Promise<boolean> => {
    try {
      const today = new Date().toDateString();
      const newEntry: MoodEntry = {
        id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: today,
        rating,
        notes: notes?.trim() || undefined,
        gameType,
        createdAt: new Date().toISOString(),
      };

      const success = await storageService.addMoodEntry(newEntry);
      if (success) {
        dispatch({ type: 'ADD_MOOD_ENTRY', payload: newEntry });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save mood entry' });
        return false;
      }
    } catch (error) {
      console.error('Error adding mood entry:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save mood entry' });
      return false;
    }
  }, [dispatch]);

  // Delete a mood entry
  const deleteMoodEntry = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      const success = await storageService.deleteMoodEntry(entryId);
      if (success) {
        dispatch({ type: 'DELETE_MOOD_ENTRY', payload: entryId });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete mood entry' });
        return false;
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete mood entry' });
      return false;
    }
  }, [dispatch]);

  // Get today's mood entry
  const getTodayMood = useCallback((): MoodEntry | null => {
    const today = new Date().toDateString();
    return state.moodEntries.find(entry => entry.date === today) || null;
  }, [state.moodEntries]);

  // Calculate mood statistics
  const getMoodStats = useCallback(memoize(() => {
    const entries = state.moodEntries;
    
    if (entries.length === 0) {
      return {
        average: 0,
        total: 0,
        streak: 0,
        trend: 'neutral' as const,
        lastWeekAverage: 0,
        thisWeekAverage: 0,
      };
    }

    // Calculate average
    const average = entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;

    // Calculate streak (consecutive days with entries)
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    for (const entry of entries) {
      const entryDate = new Date(entry.date);
      const diffTime = Math.abs(checkDate.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        checkDate = entryDate;
      } else {
        break;
      }
    }

    // Calculate trend (comparing recent vs older entries)
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (entries.length >= 6) {
      const recent = entries.slice(0, 3);
      const older = entries.slice(3, 6);
      
      const recentAvg = recent.reduce((sum, entry) => sum + entry.rating, 0) / recent.length;
      const olderAvg = older.reduce((sum, entry) => sum + entry.rating, 0) / older.length;
      
      if (recentAvg > olderAvg + 0.3) trend = 'up';
      else if (recentAvg < olderAvg - 0.3) trend = 'down';
    }

    // Calculate weekly averages
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekEntries = entries.filter(entry => 
      new Date(entry.date) >= oneWeekAgo
    );
    const lastWeekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
    });

    const thisWeekAverage = thisWeekEntries.length > 0 
      ? thisWeekEntries.reduce((sum, entry) => sum + entry.rating, 0) / thisWeekEntries.length
      : 0;
    
    const lastWeekAverage = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((sum, entry) => sum + entry.rating, 0) / lastWeekEntries.length
      : 0;

    return {
      average: Number(average.toFixed(1)),
      total: entries.length,
      streak,
      trend,
      lastWeekAverage: Number(lastWeekAverage.toFixed(1)),
      thisWeekAverage: Number(thisWeekAverage.toFixed(1)),
    };
  }, () => `${state.moodEntries.length}-${state.moodEntries[0]?.id || 'empty'}`), [state.moodEntries]);

  // Get mood entries for a specific date range
  const getMoodEntriesInRange = useCallback((startDate: Date, endDate: Date): MoodEntry[] => {
    return state.moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [state.moodEntries]);

  // Quick mood logging with confirmation
  const quickMoodLog = useCallback(async (rating: MoodRating): Promise<boolean> => {
    const success = await addMoodEntry(rating);
    if (success) {
      Alert.alert(
        'Logged! 📝',
        'Your anxiety level has been recorded. Keep building that mental strength!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Error',
        'Failed to save your mood entry. Please try again.',
        [{ text: 'OK' }]
      );
    }
    return success;
  }, [addMoodEntry]);

  return {
    // Data
    moodEntries: state.moodEntries,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addMoodEntry,
    deleteMoodEntry,
    quickMoodLog,
    
    // Computed values
    getTodayMood,
    getMoodStats,
    getMoodEntriesInRange,
  };
}