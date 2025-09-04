import NetInfo from '@react-native-community/netinfo';
import { storageService } from './storage';

class OfflineService {
  private isOnline = true;
  private pendingOperations: Array<() => Promise<void>> = [];

  constructor() {
    this.initializeNetworkListener();
  }

  private initializeNetworkListener() {
    // Note: NetInfo is not available in WebContainer, so we'll simulate offline support
    // In a real app, this would use NetInfo to detect connectivity
    this.isOnline = true;
  }

  // Check if device is online
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // Queue operation for when back online
  queueOperation(operation: () => Promise<void>): void {
    this.pendingOperations.push(operation);
  }

  // Process pending operations when back online
  async processPendingOperations(): Promise<void> {
    if (!this.isOnline || this.pendingOperations.length === 0) {
      return;
    }

    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        console.error('Error processing pending operation:', error);
        // Re-queue failed operations
        this.pendingOperations.push(operation);
      }
    }
  }

  // Ensure data is cached locally
  async ensureDataCached(): Promise<boolean> {
    try {
      // Verify all data is accessible from local storage
      const [moodEntries, exerciseSessions, routineSessions, userPreferences] = await Promise.all([
        storageService.getMoodEntries(),
        storageService.getExerciseSessions(),
        storageService.getRoutineSessions(),
        storageService.getUserPreferences(),
      ]);

      // Data is successfully cached if we can retrieve it
      return true;
    } catch (error) {
      console.error('Error ensuring data is cached:', error);
      return false;
    }
  }

  // Sync data when connection is restored
  async syncData(): Promise<boolean> {
    if (!this.isOnline) {
      return false;
    }

    try {
      // In a real app, this would sync with a remote server
      // For now, we just ensure local data integrity
      await this.processPendingOperations();
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      return false;
    }
  }
}

export const offlineService = new OfflineService();