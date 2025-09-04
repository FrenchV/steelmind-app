import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { notificationService } from '@/services/notifications';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function useNotifications() {
  const { preferences, updatePreferences } = useUserPreferences();
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(Platform.OS !== 'web');
    
    if (Platform.OS !== 'web') {
      checkPermissions();
    }
  }, []);

  const checkPermissions = async () => {
    const permission = await notificationService.requestPermissions();
    setHasPermission(permission);
  };

  // Enable notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    const permission = await notificationService.requestPermissions();
    setHasPermission(permission);

    if (permission) {
      const success = await updatePreferences({ notificationsEnabled: true });
      if (success && preferences.reminderTime) {
        await notificationService.scheduleDailyMoodReminder(preferences.reminderTime);
      }
      return success;
    }

    return false;
  }, [isSupported, updatePreferences, preferences.reminderTime]);

  // Disable notifications
  const disableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return true;
    }

    await notificationService.cancelAllNotifications();
    return updatePreferences({ notificationsEnabled: false });
  }, [isSupported, updatePreferences]);

  // Set reminder time
  const setReminderTime = useCallback(async (time: string): Promise<boolean> => {
    const success = await updatePreferences({ reminderTime: time });
    
    if (success && preferences.notificationsEnabled && hasPermission) {
      await notificationService.scheduleDailyMoodReminder(time);
    }
    
    return success;
  }, [updatePreferences, preferences.notificationsEnabled, hasPermission]);

  // Schedule pre-game reminder
  const schedulePreGameReminder = useCallback(async (gameTime: Date): Promise<boolean> => {
    if (!isSupported || !hasPermission || !preferences.notificationsEnabled) {
      return false;
    }

    return notificationService.schedulePreGameReminder(gameTime);
  }, [isSupported, hasPermission, preferences.notificationsEnabled]);

  return {
    // State
    hasPermission,
    isSupported,
    isEnabled: preferences.notificationsEnabled,
    reminderTime: preferences.reminderTime,
    
    // Actions
    enableNotifications,
    disableNotifications,
    setReminderTime,
    schedulePreGameReminder,
    checkPermissions,
  };
}