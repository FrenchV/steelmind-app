import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, CircleCheck as CheckCircle, Plus } from 'lucide-react-native';
import { useRoutine } from '@/hooks/useRoutine';
import { RoutineFlow } from '@/components/RoutineFlow';

export default function PreGameScreen() {
  const { 
    activeRoutine, 
    startRoutine, 
    completeStep, 
    uncompleteStep, 
    getTodayRoutine
  } = useRoutine();
  
  const [showFlow, setShowFlow] = useState(false);
  const todayRoutine = getTodayRoutine();

  const handleStartFlow = async () => {
    if (!activeRoutine) {
      await startRoutine();
    }
    setShowFlow(true);
  };

  const handleFlowComplete = () => {
    setShowFlow(false);
  };

  const handleFlowCancel = () => {
    setShowFlow(false);
  };

  // Show routine flow if active
  if (showFlow && activeRoutine) {
    return (
      <SafeAreaView style={styles.container}>
        <RoutineFlow
          steps={activeRoutine.steps}
          completedSteps={activeRoutine.completedSteps}
          onStepComplete={completeStep}
          onStepUncomplete={uncompleteStep}
          onComplete={handleFlowComplete}
          onCancel={handleFlowCancel}
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

  const routineSteps = [
    { emoji: '🧠', title: 'Mental Preparation', duration: '3:00 min' },
    { emoji: '🎯', title: 'Success Visualization', duration: '5:00 min' },
    { emoji: '💨', title: 'Calming Breath Work', duration: '4:00 min' },
    { emoji: '⚡', title: 'Power Affirmations', duration: '2:00 min' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <View style={styles.todoContainer}>
            <CheckCircle size={16} color="#4F46E5" />
            <Text style={styles.todoText}>
              {todayRoutine?.completed ? 'Complete' : 'Ready'}
            </Text>
          </View>
        </View>

        {/* Main Section */}
        <View style={styles.mainDateSection}>
          <Text style={styles.mainDateText}>Pre-Game Routine</Text>
        </View>

        {/* Routine Status Card */}
        <View style={styles.routineCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🔥</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>
                {todayRoutine?.completed ? 'Today\'s Routine Complete!' : '15-Minute Mental Prep'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {todayRoutine?.completed 
                  ? 'You\'re mentally ready to dominate!'
                  : 'Prepare your mind for peak performance'
                }
              </Text>
            </View>
            <TouchableOpacity style={styles.changeButton} onPress={handleStartFlow}>
              <Text style={styles.changeButtonText}>
                {todayRoutine?.completed ? 'Restart' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Routine Steps */}
        {routineSteps.map((step, index) => {
          const isCompleted = todayRoutine?.completedSteps.includes(`step-${index}`) || false;
          
          return (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepTime}>{step.duration}</Text>
                </View>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <CheckCircle size={16} color="#10B981" />
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Tips Section */}
        <View style={styles.tomorrowSection}>
          <Text style={styles.tomorrowText}>Pro Tips</Text>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Text style={styles.tipEmoji}>⏰</Text>
            <Text style={styles.tipText}>Do this 15-30 minutes before kickoff</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipEmoji}>🤫</Text>
            <Text style={styles.tipText}>Find a quiet space away from distractions</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipEmoji}>🎯</Text>
            <Text style={styles.tipText}>Trust the process - your mind is your biggest asset</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B3A',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  todoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2B5A',
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
  mainDateSection: {
    paddingVertical: 16,
  },
  mainDateText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  routineCard: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  changeButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  stepTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  completedBadge: {
    backgroundColor: '#065F46',
    padding: 8,
    borderRadius: 12,
  },
  tomorrowSection: {
    paddingVertical: 24,
  },
  tomorrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tipsCard: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#D1D5DB',
    flex: 1,
    lineHeight: 20,
  },
});