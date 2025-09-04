import { useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { storageService } from '@/services/storage';
import { UserPreferences } from '@/types';

export function useUserPreferences() {
  const { state, dispatch } = useAppContext();

  // Update user preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>): Promise<boolean> => {
    try {
      const success = await storageService.updateUserPreferences(updates);
      if (success) {
        dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: updates });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
        return false;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
      return false;
    }
  }, [dispatch]);

  // Complete onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    return updatePreferences({ onboardingCompleted: true });
  }, [updatePreferences]);

  // Toggle notifications
  const toggleNotifications = useCallback(async (): Promise<boolean> => {
    const newValue = !state.userPreferences.notificationsEnabled;
    return updatePreferences({ notificationsEnabled: newValue });
  }, [state.userPreferences.notificationsEnabled, updatePreferences]);

  // Set reminder time
  const setReminderTime = useCallback(async (time: string): Promise<boolean> => {
    return updatePreferences({ reminderTime: time });
  }, [updatePreferences]);

  // Set preferred exercise duration
  const setPreferredExerciseDuration = useCallback(async (duration: number): Promise<boolean> => {
    if (duration < 1 || duration > 30) {
      dispatch({ type: 'SET_ERROR', payload: 'Exercise duration must be between 1 and 30 minutes' });
      return false;
    }
    return updatePreferences({ preferredExerciseDuration: duration });
  }, [updatePreferences, dispatch]);

  // Reset preferences to defaults
  const resetPreferences = useCallback(async (): Promise<boolean> => {
    try {
      const defaultPrefs = {
        notificationsEnabled: true,
        preferredExerciseDuration: 5,
        onboardingCompleted: state.userPreferences.onboardingCompleted, // Keep onboarding status
      };
      
      const success = await storageService.saveUserPreferences(defaultPrefs);
      if (success) {
        dispatch({ type: 'SET_USER_PREFERENCES', payload: defaultPrefs });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to reset preferences' });
        return false;
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset preferences' });
      return false;
    }
  }, [state.userPreferences.onboardingCompleted, dispatch]);

  // Check if user needs onboarding
  const needsOnboarding = useCallback((): boolean => {
    return !state.userPreferences.onboardingCompleted;
  }, [state.userPreferences.onboardingCompleted]);

  // Get onboarding status
  const isOnboardingCompleted = useCallback((): boolean => {
    return state.userPreferences.onboardingCompleted;
  }, [state.userPreferences.onboardingCompleted]);

  return {
    // Data
    preferences: state.userPreferences,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    updatePreferences,
    completeOnboarding,
    toggleNotifications,
    setReminderTime,
    setPreferredExerciseDuration,
    resetPreferences,
    
    // Computed values
    needsOnboarding,
    isOnboardingCompleted,
  };
}