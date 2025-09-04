# Soccer Mindset Coach

A focused mobile app to help soccer players manage performance anxiety through practical mental tools, pre-game routines, and progress tracking.

## Features

### 🧠 Mental Tools
- **4-7-8 Breathing**: Calm your nerves with controlled breathing
- **Perfect Play Visualization**: Mental rehearsal for peak performance  
- **Heart Rate Reset**: Quick technique to lower anxiety

### 📊 Progress Tracking
- **Daily Mood Logging**: Track anxiety levels over time
- **Visual Progress Charts**: See your improvement trends
- **Detailed Insights**: Data-driven analysis of your mental game

### 🎯 Pre-Game Routines
- **Guided 15-minute Routine**: Mental preparation, visualization, breathing, and affirmations
- **Step-by-step Flow**: Timed exercises with clear instructions
- **Completion Tracking**: Monitor routine consistency

### 🔔 Smart Reminders
- **Daily Check-ins**: Configurable mood logging reminders
- **Pre-game Alerts**: 30-minute warnings before scheduled games
- **Platform Aware**: Works on iOS/Android, disabled on web

### 📱 Offline First
- **Complete Offline Support**: All features work without internet
- **Local Data Storage**: Your progress is always saved
- **Data Integrity**: Automatic validation and error recovery

## Technical Stack

- **Framework**: Expo SDK 53 with Expo Router 4
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Storage**: AsyncStorage with data validation
- **Notifications**: Expo Notifications (mobile only)
- **Icons**: Lucide React Native
- **Testing**: Vitest with React Native Testing Library

## Development

### Prerequisites
- Node.js 18+
- Expo CLI
- Expo Go app (for testing)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing
```bash
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Building
```bash
npm run build:web     # Build for web
```

## Project Structure

```
/app
  /(tabs)/           # Tab-based navigation
    - index.tsx      # Dashboard/Home
    - exercises.tsx  # Mental exercises
    - pregame.tsx    # Pre-game routines
    - progress.tsx   # Progress tracking
    - profile.tsx    # User profile & settings
    - _layout.tsx    # Tab navigation config

/components
  - Timer.tsx        # Reusable timer component
  - ExerciseGuide.tsx # Guided exercise flows
  - MoodChart.tsx    # Mood visualization
  - RoutineFlow.tsx  # Pre-game routine guide
  - OnboardingFlow.tsx # First-time user onboarding
  - ProgressInsights.tsx # Advanced progress analysis

/hooks
  - useMoodData.ts   # Mood tracking logic
  - useExercises.ts  # Exercise session management
  - useRoutine.ts    # Pre-game routine logic
  - useNotifications.ts # Notification management
  - useUserPreferences.ts # User settings
  - useAppData.ts    # Global app data operations
  - usePerformance.ts # Performance monitoring

/services
  - storage.ts       # AsyncStorage wrapper with validation
  - notifications.ts # Local notification scheduling
  - offline.ts       # Offline support and sync

/contexts
  - AppContext.tsx   # Global state management

/types
  - index.ts         # TypeScript type definitions

/utils
  - performance.ts   # Performance optimization utilities
```

## Data Models

### MoodEntry
```typescript
interface MoodEntry {
  id: string;
  date: string;        // ISO date string
  rating: number;      // 1-5 scale (1 = Very Anxious, 5 = Peak Flow)
  notes?: string;
  gameType?: 'practice' | 'game' | 'training';
  createdAt: string;   // ISO timestamp
}
```

### ExerciseSession
```typescript
interface ExerciseSession {
  id: string;
  exerciseType: 'breathing' | 'visualization' | 'heartrate';
  duration: number;    // in seconds
  completed: boolean;
  startTime: string;   // ISO timestamp
  endTime?: string;    // ISO timestamp
  notes?: string;
}
```

### RoutineSession
```typescript
interface RoutineSession {
  id: string;
  date: string;        // ISO date string
  steps: RoutineStep[];
  completedSteps: string[]; // array of step IDs
  totalDuration: number;    // in seconds
  completed: boolean;
  startTime: string;   // ISO timestamp
  endTime?: string;    // ISO timestamp
}
```

## Performance Optimizations

- **Memoized Calculations**: Expensive stats calculations are cached
- **Batch Processing**: Storage operations are batched for efficiency
- **Memory Management**: Automatic cleanup of timers and subscriptions
- **Debounced Updates**: User input is debounced to prevent excessive updates
- **Lazy Loading**: Components load data only when needed

## Testing Strategy

- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: Complete user flows (onboarding → logging → exercises)
- **Performance Tests**: Timer accuracy and memory usage
- **Storage Tests**: Data persistence and validation

## Offline Support

The app is designed to work completely offline:
- All user data is stored locally using AsyncStorage
- No network requests are required for core functionality
- Data validation ensures integrity even without server backup
- Pending operations are queued for when connectivity returns

## Accessibility

- Semantic component structure for screen readers
- High contrast colors for visibility
- Large touch targets for easy interaction
- Clear visual hierarchy and navigation

## Privacy & Data

- All data is stored locally on the user's device
- No personal information is transmitted to external servers
- Users can export their data at any time
- Complete data deletion is available in settings

---

Built with ❤️ to help soccer players overcome performance anxiety and achieve their mental game potential.