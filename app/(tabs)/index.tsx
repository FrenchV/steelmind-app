import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Zap, Target, Calendar, Plus, CircleCheck as CheckCircle, Play } from 'lucide-react-native';
import { useMoodData } from '@/hooks/useMoodData';
import { useExercises } from '@/hooks/useExercises';
import { useRoutine } from '@/hooks/useRoutine';
import { useNotifications } from '@/hooks/useNotifications';

export default function HomeScreen() {
  const { getTodayMood, quickMoodLog, moodEntries } = useMoodData();
  const { startExercise } = useExercises();
  const { getTodayRoutine } = useRoutine();
  const { isSupported: notificationsSupported } = useNotifications();
  
  const todayMood = getTodayMood();
  const recentEntries = moodEntries.slice(0, 3);
  const todayRoutine = getTodayRoutine();

  const getMoodEmoji = (rating: number) => {
    const emojis = ['😰', '😟', '😐', '😊', '🔥'];
    return emojis[rating - 1];
  };

  const getMoodText = (rating: number) => {
    const texts = ['Very Anxious', 'Anxious', 'Neutral', 'Confident', 'Peak Flow'];
    return texts[rating - 1];
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <View style={styles.todoContainer}>
            <CheckCircle size={16} color="#4F46E5" />
            <Text style={styles.todoText}>{recentEntries.length} Entries</Text>
          </View>
        </View>

        {/* Main Date Section */}
        <View style={styles.mainDateSection}>
          <Text style={styles.mainDateText}>Today, {getCurrentDate().split(', ')[1]}</Text>
        </View>

        {/* Quick Mood Check Card */}
        <View style={styles.moodCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>⚽</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Mental Check-in</Text>
              <Text style={styles.cardSubtitle}>How's your mindset today?</Text>
            </View>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Log</Text>
            </TouchableOpacity>
          </View>
          
          {todayMood ? (
            <View style={styles.moodDisplay}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(todayMood.rating)}</Text>
              <Text style={styles.moodText}>{getMoodText(todayMood.rating)}</Text>
              <Text style={styles.moodSubtext}>Logged for today</Text>
            </View>
          ) : (
            <View style={styles.moodButtons}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.moodButton}
                  onPress={() => quickMoodLog(rating)}
                >
                  <Text style={styles.moodButtonEmoji}>{getMoodEmoji(rating)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Exercise Activities */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityEmoji}>🧠</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Breathing Exercise</Text>
              <Text style={styles.activityTime}>3:00-5:00 min</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.activityButton}
            onPress={() => startExercise('breathing')}
          >
            <Play size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityEmoji}>🎯</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Visualization</Text>
              <Text style={styles.activityTime}>5:00-10:00 min</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.activityButton}
            onPress={() => startExercise('visualization')}
          >
            <Play size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tomorrow Section */}
        <View style={styles.tomorrowSection}>
          <Text style={styles.tomorrowText}>Tomorrow, {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
        </View>

        {/* Pre-Game Routine Card */}
        <View style={styles.routineCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🔥</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Pre-Game Routine</Text>
              <Text style={styles.cardSubtitle}>15-minute mental prep</Text>
            </View>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Card */}
        <View style={styles.quickActionCard}>
          <View style={styles.quickActionHeader}>
            <Text style={styles.quickActionEmoji}>💪</Text>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Quick confidence boost...</Text>
              <Text style={styles.quickActionTime}>2:00-3:00 min</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivational Message */}
        {!notificationsSupported && (
          <View style={styles.offlineCard}>
            <Text style={styles.offlineText}>
              📱 All features work offline - your progress is always saved locally!
            </Text>
          </View>
        )}
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
  moodCard: {
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
    marginBottom: 16,
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
  moodDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moodSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#3A3B6A',
    flex: 1,
    minHeight: 60,
  },
  moodButtonEmoji: {
    fontSize: 24,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  activityButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tomorrowSection: {
    paddingVertical: 24,
  },
  tomorrowText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  routineCard: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  quickActionCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  quickActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  quickActionTime: {
    fontSize: 14,
    color: '#C7D2FE',
  },
  addButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  offlineText: {
    fontSize: 14,
    color: '#BFDBFE',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});