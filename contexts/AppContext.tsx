import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { 
  AppState, 
  MoodEntry, 
  ExerciseSession, 
  RoutineSession, 
  UserPreferences,
  DEFAULT_USER_PREFERENCES 
} from '@/types';
import { storageService } from '@/services/storage';

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MOOD_ENTRIES'; payload: MoodEntry[] }
  | { type: 'ADD_MOOD_ENTRY'; payload: MoodEntry }
  | { type: 'DELETE_MOOD_ENTRY'; payload: string }
  | { type: 'SET_EXERCISE_SESSIONS'; payload: ExerciseSession[] }
  | { type: 'ADD_EXERCISE_SESSION'; payload: ExerciseSession }
  | { type: 'UPDATE_EXERCISE_SESSION'; payload: { id: string; updates: Partial<ExerciseSession> } }
  | { type: 'SET_ROUTINE_SESSIONS'; payload: RoutineSession[] }
  | { type: 'ADD_ROUTINE_SESSION'; payload: RoutineSession }
  | { type: 'UPDATE_ROUTINE_SESSION'; payload: { id: string; updates: Partial<RoutineSession> } }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'CLEAR_ALL_DATA' };

// Initial state
const initialState: AppState = {
  moodEntries: [],
  exerciseSessions: [],
  routineSessions: [],
  userPreferences: DEFAULT_USER_PREFERENCES,
  isLoading: true,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_MOOD_ENTRIES':
      return { ...state, moodEntries: action.payload };
    
    case 'ADD_MOOD_ENTRY':
      // Remove existing entry for the same date, then add new one
      const filteredMoodEntries = state.moodEntries.filter(
        entry => entry.date !== action.payload.date
      );
      return {
        ...state,
        moodEntries: [action.payload, ...filteredMoodEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      };
    
    case 'DELETE_MOOD_ENTRY':
      return {
        ...state,
        moodEntries: state.moodEntries.filter(entry => entry.id !== action.payload)
      };
    
    case 'SET_EXERCISE_SESSIONS':
      return { ...state, exerciseSessions: action.payload };
    
    case 'ADD_EXERCISE_SESSION':
      return {
        ...state,
        exerciseSessions: [action.payload, ...state.exerciseSessions].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
      };
    
    case 'UPDATE_EXERCISE_SESSION':
      return {
        ...state,
        exerciseSessions: state.exerciseSessions.map(session =>
          session.id === action.payload.id 
            ? { ...session, ...action.payload.updates }
            : session
        )
      };
    
    case 'SET_ROUTINE_SESSIONS':
      return { ...state, routineSessions: action.payload };
    
    case 'ADD_ROUTINE_SESSION':
      return {
        ...state,
        routineSessions: [action.payload, ...state.routineSessions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      };
    
    case 'UPDATE_ROUTINE_SESSION':
      return {
        ...state,
        routineSessions: state.routineSessions.map(session =>
          session.id === action.payload.id 
            ? { ...session, ...action.payload.updates }
            : session
        )
      };
    
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload }
      };
    
    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        isLoading: false,
        userPreferences: DEFAULT_USER_PREFERENCES,
      };
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const mounted = useRef(true);

  // Load initial data on app start
  useEffect(() => {
    loadInitialData();
    
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const [moodEntries, exerciseSessions, routineSessions, userPreferences] = await Promise.all([
        storageService.getMoodEntries(),
        storageService.getExerciseSessions(),
        storageService.getRoutineSessions(),
        storageService.getUserPreferences(),
      ]);

      if (!mounted.current) return;
      
      dispatch({ type: 'SET_MOOD_ENTRIES', payload: moodEntries });
      dispatch({ type: 'SET_EXERCISE_SESSIONS', payload: exerciseSessions });
      dispatch({ type: 'SET_ROUTINE_SESSIONS', payload: routineSessions });
      dispatch({ type: 'SET_USER_PREFERENCES', payload: userPreferences });
    } catch (error) {
      console.error('Error loading initial data:', error);
      if (!mounted.current) return;
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
    } finally {
      if (!mounted.current) return;
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}