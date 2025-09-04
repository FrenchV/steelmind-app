import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { storageService } from '@/services/storage';
import { ExerciseSession, ExerciseType } from '@/types';

export function useExercises() {
  const { state, dispatch } = useAppContext();
  const [activeSession, setActiveSession] = useState<ExerciseSession | null>(null);

  // Start a new exercise session
  const startExercise = useCallback(async (exerciseType: ExerciseType): Promise<string | null> => {
    try {
      const newSession: ExerciseSession = {
        id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        exerciseType,
        duration: 0,
        completed: false,
        startTime: new Date().toISOString(),
      };

      setActiveSession(newSession);
      return newSession.id;
    } catch (error) {
      console.error('Error starting exercise:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start exercise' });
      return null;
    }
  }, [dispatch]);

  // Complete an exercise session
  const completeExercise = useCallback(async (
    sessionId: string,
    duration: number,
    notes?: string
  ): Promise<boolean> => {
    try {
      if (!activeSession || activeSession.id !== sessionId) {
        dispatch({ type: 'SET_ERROR', payload: 'No active exercise session found' });
        return false;
      }

      const completedSession: ExerciseSession = {
        ...activeSession,
        duration,
        completed: true,
        endTime: new Date().toISOString(),
        notes: notes?.trim() || undefined,
      };

      const success = await storageService.addExerciseSession(completedSession);
      if (success) {
        dispatch({ type: 'ADD_EXERCISE_SESSION', payload: completedSession });
        setActiveSession(null);
        
        Alert.alert(
          'Exercise Complete! 🎉',
          `Great job completing your ${getExerciseName(activeSession.exerciseType)} session. You're building mental resilience!`,
          [{ text: 'Awesome!' }]
        );
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save exercise session' });
        return false;
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete exercise' });
      return false;
    }
  }, [activeSession, dispatch]);

  // Cancel an active exercise session
  const cancelExercise = useCallback(() => {
    setActiveSession(null);
  }, []);

  // Update active session duration (for timer)
  const updateSessionDuration = useCallback((duration: number) => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, duration } : null);
    }
  }, [activeSession]);

  // Get exercise statistics
  const getExerciseStats = useCallback(() => {
    const sessions = state.exerciseSessions;
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        completionRate: 0,
        favoriteExercise: null,
        thisWeekSessions: 0,
        lastWeekSessions: 0,
      };
    }

    const completedSessions = sessions.filter(session => session.completed);
    const totalDuration = completedSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageDuration = totalDuration / completedSessions.length;
    const completionRate = (completedSessions.length / sessions.length) * 100;

    // Find favorite exercise type
    const exerciseCounts = completedSessions.reduce((counts, session) => {
      counts[session.exerciseType] = (counts[session.exerciseType] || 0) + 1;
      return counts;
    }, {} as Record<ExerciseType, number>);

    const favoriteExercise = Object.entries(exerciseCounts).reduce((a, b) => 
      exerciseCounts[a[0] as ExerciseType] > exerciseCounts[b[0] as ExerciseType] ? a : b
    )?.[0] as ExerciseType || null;

    // Calculate weekly sessions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekSessions = sessions.filter(session => 
      new Date(session.startTime) >= oneWeekAgo
    ).length;

    const lastWeekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= twoWeeksAgo && sessionDate < oneWeekAgo;
    }).length;

    return {
      totalSessions: sessions.length,
      totalDuration: Math.round(totalDuration),
      averageDuration: Math.round(averageDuration),
      completionRate: Math.round(completionRate),
      favoriteExercise,
      thisWeekSessions,
      lastWeekSessions,
    };
  }, [state.exerciseSessions]);

  // Get recent exercise sessions
  const getRecentSessions = useCallback((limit: number = 5): ExerciseSession[] => {
    return state.exerciseSessions
      .filter(session => session.completed)
      .slice(0, limit);
  }, [state.exerciseSessions]);

  // Helper function to get exercise display name
  const getExerciseName = (type: ExerciseType): string => {
    const names = {
      breathing: '4-7-8 Breathing',
      visualization: 'Perfect Play Visualization',
      heartrate: 'Heart Rate Reset',
    };
    return names[type];
  };

  return {
    // Data
    exerciseSessions: state.exerciseSessions,
    activeSession,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    startExercise,
    completeExercise,
    cancelExercise,
    updateSessionDuration,
    
    // Computed values
    getExerciseStats,
    getRecentSessions,
    getExerciseName,
  };
}