import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { storageService } from '@/services/storage';

export function useAppData() {
  const { state, dispatch } = useAppContext();

  // Clear all app data
  const clearAllData = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Clear All Data',
        'Are you sure you want to delete all your progress data? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Clear Data',
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await storageService.clearAllData();
                if (success) {
                  dispatch({ type: 'CLEAR_ALL_DATA' });
                  Alert.alert('Success', 'All data has been cleared.');
                  resolve(true);
                } else {
                  Alert.alert('Error', 'Failed to clear data. Please try again.');
                  resolve(false);
                }
              } catch (error) {
                console.error('Error clearing data:', error);
                Alert.alert('Error', 'Failed to clear data. Please try again.');
                resolve(false);
              }
            }
          }
        ]
      );
    });
  }, [dispatch]);

  // Export app data
  const exportData = useCallback(async (): Promise<string | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const exportedData = await storageService.exportData();
      
      if (exportedData) {
        Alert.alert(
          'Data Exported',
          'Your data has been exported successfully. You can save this backup for your records.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to export data. Please try again.');
      }
      
      return exportedData;
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  // Refresh all data from storage
  const refreshData = useCallback(async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const [moodEntries, exerciseSessions, routineSessions, userPreferences] = await Promise.all([
        storageService.getMoodEntries(),
        storageService.getExerciseSessions(),
        storageService.getRoutineSessions(),
        storageService.getUserPreferences(),
      ]);

      dispatch({ type: 'SET_MOOD_ENTRIES', payload: moodEntries });
      dispatch({ type: 'SET_EXERCISE_SESSIONS', payload: exerciseSessions });
      dispatch({ type: 'SET_ROUTINE_SESSIONS', payload: routineSessions });
      dispatch({ type: 'SET_USER_PREFERENCES', payload: userPreferences });
      
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh app data' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  // Get overall app statistics
  const getAppStats = useCallback(() => {
    const { moodEntries, exerciseSessions, routineSessions } = state;
    
    const totalMoodEntries = moodEntries.length;
    const totalExerciseSessions = exerciseSessions.filter(s => s.completed).length;
    const totalRoutineSessions = routineSessions.filter(s => s.completed).length;
    
    // Calculate days since first entry
    const allDates = [
      ...moodEntries.map(e => new Date(e.date)),
      ...exerciseSessions.map(e => new Date(e.startTime)),
      ...routineSessions.map(r => new Date(r.date)),
    ].sort((a, b) => a.getTime() - b.getTime());
    
    const daysSinceStart = allDates.length > 0 
      ? Math.ceil((Date.now() - allDates[0].getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate total time spent in exercises
    const totalExerciseTime = exerciseSessions
      .filter(s => s.completed)
      .reduce((sum, session) => sum + session.duration, 0);

    return {
      totalMoodEntries,
      totalExerciseSessions,
      totalRoutineSessions,
      daysSinceStart,
      totalExerciseTime: Math.round(totalExerciseTime / 60), // in minutes
      totalActivities: totalMoodEntries + totalExerciseSessions + totalRoutineSessions,
    };
  }, [state]);

  // Clear error state
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  return {
    // Data
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    clearAllData,
    exportData,
    refreshData,
    clearError,
    
    // Computed values
    getAppStats,
  };
}