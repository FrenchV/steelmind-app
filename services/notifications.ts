import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private hasPermission = false;

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web doesn't support local notifications in Expo Go
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule daily mood reminder
  async scheduleDailyMoodReminder(time: string = '19:00'): Promise<boolean> {
    try {
      if (!this.hasPermission || Platform.OS === 'web') {
        return false;
      }

      // Cancel existing mood reminders
      await this.cancelMoodReminders();

      const [hours, minutes] = time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'How was your game today? ⚽',
          body: 'Take a moment to log your anxiety level and build mental awareness.',
          data: { type: 'mood_reminder' },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      return true;
    } catch (error) {
      console.error('Error scheduling mood reminder:', error);
      return false;
    }
  }

  // Schedule pre-game routine reminder
  async schedulePreGameReminder(gameTime: Date): Promise<boolean> {
    try {
      if (!this.hasPermission || Platform.OS === 'web') {
        return false;
      }

      // Schedule 30 minutes before game time
      const reminderTime = new Date(gameTime.getTime() - 30 * 60 * 1000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Game Time Approaching! 🔥',
          body: 'Start your pre-game mental routine now to perform at your best.',
          data: { type: 'pregame_reminder' },
        },
        trigger: reminderTime,
      });

      return true;
    } catch (error) {
      console.error('Error scheduling pre-game reminder:', error);
      return false;
    }
  }

  // Cancel mood reminders
  async cancelMoodReminders(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const moodReminders = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'mood_reminder'
      );

      for (const reminder of moodReminders) {
        await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
      }
    } catch (error) {
      console.error('Error canceling mood reminders:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get scheduled notifications count
  async getScheduledCount(): Promise<number> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();