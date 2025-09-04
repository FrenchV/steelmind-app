import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { storageService } from '@/services/storage';
import { RoutineSession, RoutineStep, DEFAULT_ROUTINE_STEPS } from '@/types';

export function useRoutine() {
  const { state, dispatch } = useAppContext();
  const [activeRoutine, setActiveRoutine] = useState<RoutineSession | null>(null);

  // Start a new routine session
  const startRoutine = useCallback(async (): Promise<string | null> => {
    try {
      const today = new Date().toDateString();
      
      // Check if routine already exists for today
      const existingRoutine = state.routineSessions.find(session => session.date === today);
      if (existingRoutine) {
        setActiveRoutine(existingRoutine);
        return existingRoutine.id;
      }

      const newRoutine: RoutineSession = {
        id: `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: today,
        steps: DEFAULT_ROUTINE_STEPS,
        completedSteps: [],
        totalDuration: 0,
        completed: false,
        startTime: new Date().toISOString(),
      };

      setActiveRoutine(newRoutine);
      return newRoutine.id;
    } catch (error) {
      console.error('Error starting routine:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start routine' });
      return null;
    }
  }, [state.routineSessions, dispatch]);

  // Complete a routine step
  const completeStep = useCallback(async (stepId: string): Promise<boolean> => {
    try {
      if (!activeRoutine) {
        dispatch({ type: 'SET_ERROR', payload: 'No active routine session' });
        return false;
      }

      const updatedCompletedSteps = [...activeRoutine.completedSteps];
      if (!updatedCompletedSteps.includes(stepId)) {
        updatedCompletedSteps.push(stepId);
      }

      const isFullyCompleted = updatedCompletedSteps.length === activeRoutine.steps.length;
      const now = new Date().toISOString();

      const updatedRoutine: RoutineSession = {
        ...activeRoutine,
        completedSteps: updatedCompletedSteps,
        completed: isFullyCompleted,
        endTime: isFullyCompleted ? now : activeRoutine.endTime,
      };

      setActiveRoutine(updatedRoutine);

      // Save to storage if routine is completed
      if (isFullyCompleted) {
        const success = await storageService.addRoutineSession(updatedRoutine);
        if (success) {
          dispatch({ type: 'ADD_ROUTINE_SESSION', payload: updatedRoutine });
          Alert.alert(
            'Routine Complete! 🔥',
            'You\'ve completed your pre-game routine. Step onto that field with confidence - you\'re mentally prepared for success!',
            [{ text: 'Let\'s Go!' }]
          );
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to save routine session' });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error completing step:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete step' });
      return false;
    }
  }, [activeRoutine, dispatch]);

  // Uncomplete a routine step
  const uncompleteStep = useCallback((stepId: string) => {
    if (!activeRoutine) return;

    const updatedCompletedSteps = activeRoutine.completedSteps.filter(id => id !== stepId);
    
    setActiveRoutine({
      ...activeRoutine,
      completedSteps: updatedCompletedSteps,
      completed: false,
      endTime: undefined,
    });
  }, [activeRoutine]);

  // Reset routine (start over)
  const resetRoutine = useCallback(() => {
    if (activeRoutine) {
      setActiveRoutine({
        ...activeRoutine,
        completedSteps: [],
        completed: false,
        totalDuration: 0,
        endTime: undefined,
      });
    }
  }, [activeRoutine]);

  // Get today's routine
  const getTodayRoutine = useCallback((): RoutineSession | null => {
    const today = new Date().toDateString();
    return state.routineSessions.find(session => session.date === today) || activeRoutine;
  }, [state.routineSessions, activeRoutine]);

  // Calculate routine statistics
  const getRoutineStats = useCallback(() => {
    const sessions = state.routineSessions;
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        completionRate: 0,
        averageDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        thisWeekSessions: 0,
        lastWeekSessions: 0,
      };
    }

    const completedSessions = sessions.filter(session => session.completed);
    const completionRate = (completedSessions.length / sessions.length) * 100;
    
    // Calculate average duration for completed sessions
    const totalDuration = completedSessions.reduce((sum, session) => sum + session.totalDuration, 0);
    const averageDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;

    // Calculate current streak
    let currentStreak = 0;
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const session of sortedSessions) {
      if (session.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (const session of sortedSessions.reverse()) {
      if (session.completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate weekly sessions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekSessions = sessions.filter(session => 
      new Date(session.date) >= oneWeekAgo
    ).length;

    const lastWeekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= twoWeeksAgo && sessionDate < oneWeekAgo;
    }).length;

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      completionRate: Math.round(completionRate),
      averageDuration: Math.round(averageDuration),
      currentStreak,
      longestStreak,
      thisWeekSessions,
      lastWeekSessions,
    };
  }, [state.routineSessions]);

  // Get step completion percentage for active routine
  const getStepProgress = useCallback((): number => {
    if (!activeRoutine) return 0;
    return (activeRoutine.completedSteps.length / activeRoutine.steps.length) * 100;
  }, [activeRoutine]);

  // Check if a specific step is completed
  const isStepCompleted = useCallback((stepId: string): boolean => {
    return activeRoutine?.completedSteps.includes(stepId) || false;
  }, [activeRoutine]);

  // Get next incomplete step
  const getNextStep = useCallback((): RoutineStep | null => {
    if (!activeRoutine) return null;
    
    return activeRoutine.steps.find(step => 
      !activeRoutine.completedSteps.includes(step.id)
    ) || null;
  }, [activeRoutine]);

  // Get recent routine sessions
  const getRecentSessions = useCallback((limit: number = 5): RoutineSession[] => {
    return state.routineSessions
      .filter(session => session.completed)
      .slice(0, limit);
  }, [state.routineSessions]);

  // Load today's routine if it exists
  const loadTodayRoutine = useCallback(async () => {
    const todayRoutine = getTodayRoutine();
    if (todayRoutine && !todayRoutine.completed) {
      setActiveRoutine(todayRoutine);
    }
  }, [getTodayRoutine]);

  return {
    // Data
    routineSessions: state.routineSessions,
    activeRoutine,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    startRoutine,
    completeStep,
    uncompleteStep,
    resetRoutine,
    loadTodayRoutine,
    
    // Computed values
    getTodayRoutine,
    getRoutineStats,
    getStepProgress,
    isStepCompleted,
    getNextStep,
    getRecentSessions,
  };
}