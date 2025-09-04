import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseGuide } from '@/components/ExerciseGuide';
import { ExerciseType } from '@/types';

export default function ExercisesScreen() {
  const { 
    startExercise, 
    completeExercise, 
    cancelExercise,
    getExerciseName,
    getRecentSessions
  } = useExercises();
  
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const recentSessions = getRecentSessions(3);

  const handleExerciseComplete = async (duration: number) => {
    if (selectedExercise) {
      const sessionId = await startExercise(selectedExercise);
      if (sessionId) {
        await completeExercise(sessionId, duration);
      }
    }
    setSelectedExercise(null);
  };

  const handleExerciseCancel = () => {
    cancelExercise();
    setSelectedExercise(null);
  };

  // Show exercise guide if one is selected
  if (selectedExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.exerciseHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedExercise(null)}
          >
            <ArrowLeft size={20} color="#9CA3AF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ExerciseGuide
          exerciseType={selectedExercise}
          onComplete={handleExerciseComplete}
          onCancel={handleExerciseCancel}
        />
      </SafeAreaView>
    );
  }

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const exercises = [
    {
      id: 'breathing' as ExerciseType,
      title: '4-7-8 Breathing',
      description: 'Calm your nerves instantly',
      emoji: '🧠',
      duration: '3-5 min',
      color: '#4F46E5',
    },
    {
      id: 'visualization' as ExerciseType,
      title: 'Perfect Play Visualization',
      description: 'See yourself succeeding',
      emoji: '🎯',
      duration: '5-10 min',
      color: '#7C3AED',
    },
    {
      id: 'heartrate' as ExerciseType,
      title: 'Heart Rate Reset',
      description: 'Quick anxiety relief',
      emoji: '❤️',
      duration: '2-3 min',
      color: '#EC4899',
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <View style={styles.todoContainer}>
            <CheckCircle size={16} color="#4F46E5" />
            <Text style={styles.todoText}>{recentSessions.length} Done</Text>
          </View>
        </View>

        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Mental Exercises</Text>
        </View>

        {/* Exercise Cards */}
        <View style={styles.exercisesContainer}>
          {exercises.map((exercise) => (
            <TouchableOpacity 
              key={exercise.id} 
              style={styles.exerciseCard}
              onPress={() => setSelectedExercise(exercise.id)}
            >
              <View style={styles.exerciseContent}>
                <View style={styles.exerciseLeft}>
                  <Text style={styles.exerciseEmoji}>{exercise.emoji}</Text>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                    <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                  </View>
                </View>
                <View style={[styles.playButton, { backgroundColor: exercise.color }]}>
                  <Play size={20} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
            </View>
            
            <View style={styles.sessionsContainer}>
              {recentSessions.map((session, index) => (
                <View key={index} style={styles.sessionCard}>
                  <View style={styles.sessionContent}>
                    <Text style={styles.sessionEmoji}>✅</Text>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>{getExerciseName(session.exerciseType)}</Text>
                      <Text style={styles.sessionDuration}>
                        {Math.floor(session.duration / 60)}m {session.duration % 60}s completed
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  todoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  todoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  titleSection: {
    paddingBottom: 32,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0F0F23',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  exercisesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  exerciseDuration: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  sectionHeader: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sessionDuration: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});