import '@testing-library/jest-dom';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Expo modules
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-router', () => ({
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  StyleSheet: {
    create: (styles: any) => styles,
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
}));

// Global test utilities
global.mockAsyncStorage = mockAsyncStorage;