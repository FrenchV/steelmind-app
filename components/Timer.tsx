import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw, Square } from 'lucide-react-native';
import { usePerformance } from '@/hooks/usePerformance';

interface TimerProps {
  duration?: number; // in seconds, 0 means unlimited
  onComplete?: (elapsedTime: number) => void;
  onCancel?: () => void;
  autoStart?: boolean;
  showControls?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function Timer({ 
  duration = 0, 
  onComplete, 
  onCancel,
  autoStart = false,
  showControls = true,
  size = 'medium'
}: TimerProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addCleanup } = usePerformance();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          
          // Check if duration is reached (if duration is set)
          if (duration > 0 && newTime >= duration) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.(newTime);
          }
          
          return newTime;
        });
      }, 1000);
      intervalRef.current = interval;
    } else {
      if (interval) {
        clearInterval(interval);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Add cleanup function
    addCleanup(() => {
      if (interval) clearInterval(interval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    });

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isCompleted, duration, onComplete, addCleanup]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    if (duration === 0) return null;
    return Math.max(0, duration - timeElapsed);
  };

  const getProgress = () => {
    if (duration === 0) return 0;
    return Math.min(100, (timeElapsed / duration) * 100);
  };

  const handlePlayPause = () => {
    if (isCompleted) {
      // Reset timer
      setTimeElapsed(0);
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setTimeElapsed(0);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    onCancel?.();
  };

  const sizeConfig = {
    small: { timerSize: 28, containerPadding: 16, buttonSize: 40 },
    medium: { timerSize: 48, containerPadding: 24, buttonSize: 56 },
    large: { timerSize: 64, containerPadding: 32, buttonSize: 72 },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.container, { padding: config.containerPadding }]}>
      {/* Progress Ring for Timed Exercises */}
      {duration > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressRing}>
            <View 
              style={[
                styles.progressTrack,
                {
                  borderColor: isCompleted ? '#10B981' : '#4F46E5',
                  borderWidth: 4,
                }
              ]} 
            />
            <View 
              style={[
                styles.progressFill,
                {
                  borderColor: isCompleted ? '#10B981' : '#4F46E5',
                  borderWidth: 4,
                  transform: [{ rotate: `${(getProgress() * 3.6) - 90}deg` }],
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Text style={[styles.timerText, { fontSize: config.timerSize }]}>
          {duration > 0 ? formatTime(getTimeRemaining() || 0) : formatTime(timeElapsed)}
        </Text>
        <Text style={styles.timerSubtext}>
          {duration > 0 
            ? (isCompleted ? 'Complete!' : 'remaining')
            : 'elapsed'
          }
        </Text>
      </View>

      {/* Controls */}
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { width: config.buttonSize, height: config.buttonSize }]}
            onPress={handlePlayPause}
          >
            {isCompleted ? (
              <RotateCcw size={config.buttonSize * 0.4} color="#FFFFFF" />
            ) : isRunning ? (
              <Pause size={config.buttonSize * 0.4} color="#FFFFFF" />
            ) : (
              <Play size={config.buttonSize * 0.4} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, { width: config.buttonSize * 0.8, height: config.buttonSize * 0.8 }]}
            onPress={handleReset}
          >
            <RotateCcw size={config.buttonSize * 0.3} color="#9CA3AF" />
          </TouchableOpacity>

          {onCancel && (
            <TouchableOpacity
              style={[styles.stopButton, { width: config.buttonSize * 0.8, height: config.buttonSize * 0.8 }]}
              onPress={handleStop}
            >
              <Square size={config.buttonSize * 0.3} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <Text style={styles.completionText}>
          Great job! You've completed your exercise. 🎉
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  progressContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 4,
  },
  progressFill: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: '#4F46E5',
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 1,
  },
  timerText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  timerSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
  },
});