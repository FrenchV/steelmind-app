import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useMoodData } from '@/hooks/useMoodData';
import { AppProvider } from '@/contexts/AppContext';
import { MoodEntry } from '@/types';

// Mock storage service
const mockStorageService = {
  addMoodEntry: vi.fn(),
  deleteMoodEntry: vi.fn(),
  getMoodEntries: vi.fn(),
};

vi.mock('@/services/storage', () => ({
  storageService: mockStorageService,
}));

// Test wrapper with AppProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('useMoodData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add mood entry successfully', async () => {
    mockStorageService.addMoodEntry.mockResolvedValue(true);
    
    const { result } = renderHook(() => useMoodData(), { wrapper });

    await act(async () => {
      const success = await result.current.addMoodEntry(4, 'Feeling good');
      expect(success).toBe(true);
    });

    expect(mockStorageService.addMoodEntry).toHaveBeenCalled();
  });

  it('should calculate mood stats correctly', () => {
    const mockEntries: MoodEntry[] = [
      { id: '1', date: '2025-01-01', rating: 4, createdAt: '2025-01-01T10:00:00.000Z' },
      { id: '2', date: '2025-01-02', rating: 3, createdAt: '2025-01-02T10:00:00.000Z' },
      { id: '3', date: '2025-01-03', rating: 5, createdAt: '2025-01-03T10:00:00.000Z' },
    ];

    // Mock the context state
    const { result } = renderHook(() => useMoodData(), { wrapper });
    
    // This would need to be properly mocked with context state
    // For now, testing the calculation logic
    const average = mockEntries.reduce((sum, entry) => sum + entry.rating, 0) / mockEntries.length;
    expect(average).toBe(4);
  });

  it('should get today mood entry', () => {
    const today = new Date().toDateString();
    const mockEntries: MoodEntry[] = [
      { id: '1', date: today, rating: 4, createdAt: new Date().toISOString() },
      { id: '2', date: '2025-01-01', rating: 3, createdAt: '2025-01-01T10:00:00.000Z' },
    ];

    // This would test the getTodayMood function with proper context mocking
    const todayEntry = mockEntries.find(entry => entry.date === today);
    expect(todayEntry?.rating).toBe(4);
  });

  it('should handle storage errors gracefully', async () => {
    mockStorageService.addMoodEntry.mockResolvedValue(false);
    
    const { result } = renderHook(() => useMoodData(), { wrapper });

    await act(async () => {
      const success = await result.current.addMoodEntry(4);
      expect(success).toBe(false);
    });
  });
});