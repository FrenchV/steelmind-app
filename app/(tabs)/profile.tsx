import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, CircleHelp as HelpCircle, Heart, Trash2, Award, Target, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useMoodData } from '@/hooks/useMoodData';
import { useExercises } from '@/hooks/useExercises';
import { useRoutine } from '@/hooks/useRoutine';
import { useAppData } from '@/hooks/useAppData';
import { useNotifications } from '@/hooks/useNotifications';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function ProfileScreen() {
  const { getMoodStats } = useMoodData();
  const { getExerciseStats } = useExercises();
  const { getRoutineStats } = useRoutine();
  const { clearAllData, getAppStats } = useAppData();
  const { 
    hasPermission, 
    isSupported, 
    isEnabled, 
    reminderTime,
    enableNotifications, 
    disableNotifications, 
    setReminderTime 
  } = useNotifications();
  const { preferences } = useUserPreferences();
  
  const [joinDate] = useState(new Date().toLocaleDateString());

  const moodStats = getMoodStats();
  const exerciseStats = getExerciseStats();
  const routineStats = getRoutineStats();
  const appStats = getAppStats();

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const showAbout = () => {
    Alert.alert(
      'About Soccer Mindset Coach',
      'This app helps soccer players manage performance anxiety through practical mental tools and progress tracking.\n\nVersion 1.0.0\n\nRemember: This app is not a substitute for professional mental health care.',
      [{ text: 'OK' }]
    );
  };

  const toggleNotifications = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      const success = await enableNotifications();
      if (!success && isSupported) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const changeReminderTime = () => {
    Alert.prompt(
      'Set Reminder Time',
      'Enter time in HH:MM format (24-hour)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: async (time) => {
            if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
              await setReminderTime(time);
            } else {
              Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 19:00)');
            }
          }
        }
      ],
      'plain-text',
      reminderTime || '19:00'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <View style={styles.todoContainer}>
            <CheckCircle size={16} color="#4F46E5" />
            <Text style={styles.todoText}>Profile</Text>
          </View>
        </View>

        {/* Main Section */}
        <View style={styles.mainDateSection}>
          <Text style={styles.mainDateText}>Soccer Mindset Coach</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View style={styles.profileIcon}>
              <User size={24} color="#4F46E5" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Your Mental Game</Text>
              <Text style={styles.cardSubtitle}>Performance companion</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{moodStats.total}</Text>
            <Text style={styles.statLabel}>Mood Entries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{moodStats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{exerciseStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{routineStats.completedSessions}</Text>
            <Text style={styles.statLabel}>Routines</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.tomorrowSection}>
          <Text style={styles.tomorrowText}>Settings</Text>
        </View>

        {/* Settings Cards */}
        {isSupported && (
          <TouchableOpacity style={styles.settingCard} onPress={toggleNotifications}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingEmoji}>🔔</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Daily Reminders</Text>
                <Text style={styles.settingSubtitle}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <View style={[styles.toggle, isEnabled && styles.toggleActive]}>
                <View style={[styles.toggleDot, isEnabled && styles.toggleDotActive]} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.settingCard} onPress={showAbout}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingEmoji}>ℹ️</Text>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>About the App</Text>
              <Text style={styles.settingSubtitle}>Version & info</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingCard} onPress={clearAllData}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingEmoji}>🗑️</Text>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Clear All Data</Text>
              <Text style={styles.settingSubtitle}>Reset everything</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Motivational Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>You're Building Mental Strength! 💪</Text>
          <Text style={styles.motivationText}>
            You've completed {appStats.totalActivities} activities. Every interaction strengthens your mental game. Keep going!
          </Text>
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
  profileCard: {
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
  profileIcon: {
    backgroundColor: '#4F46E520',
    padding: 12,
    borderRadius: 12,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#2A2B5A',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tomorrowSection: {
    paddingVertical: 24,
  },
  tomorrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingCard: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: '#3A3B6A',
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4F46E5',
  },
  toggleDot: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  motivationCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 15,
    color: '#C7D2FE',
    lineHeight: 22,
  },
});