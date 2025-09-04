import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, Target, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useMoodData } from '@/hooks/useMoodData';
import { MoodChart } from '@/components/MoodChart';
import { ProgressInsights } from '@/components/ProgressInsights';
import { useExercises } from '@/hooks/useExercises';
import { useRoutine } from '@/hooks/useRoutine';
import { MoodRating, GameType } from '@/types';

export default function ProgressScreen() {
  const { moodEntries, addMoodEntry, getMoodStats } = useMoodData();
  const { exerciseSessions } = useExercises();
  const { routineSessions } = useRoutine();
  const [selectedRating, setSelectedRating] = useState<MoodRating>(3);
  const [notes, setNotes] = useState<string>('');
  const [gameType, setGameType] = useState<GameType | undefined>(undefined);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'insights'>('chart');

  const handleAddMoodEntry = async () => {
    const success = await addMoodEntry(selectedRating, notes, gameType);
    if (success) {
      setNotes('');
      setSelectedRating(3);
      setGameType(undefined);
      setShowAddEntry(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const stats = getMoodStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <View style={styles.todoContainer}>
            <CheckCircle size={16} color="#4F46E5" />
            <Text style={styles.todoText}>{moodEntries.length} Entries</Text>
          </View>
        </View>

        {/* Main Section */}
        <View style={styles.mainDateSection}>
          <Text style={styles.mainDateText}>Your Progress</Text>
        </View>

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'chart' && styles.activeTab]}
              onPress={() => setActiveTab('chart')}
            >
              <Text style={[styles.tabText, activeTab === 'chart' && styles.activeTabText]}>
                Mood Chart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
              onPress={() => setActiveTab('insights')}
            >
              <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
                Insights
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.chartContent}>
            {activeTab === 'chart' ? (
              <MoodChart moodEntries={moodEntries} showTrend={true} maxEntries={14} />
            ) : (
              <ProgressInsights 
                moodEntries={moodEntries}
                exerciseSessions={exerciseSessions}
                routineSessions={routineSessions}
              />
            )}
          </View>
        </View>

        {/* Add Entry Card */}
        <View style={styles.addEntryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>📊</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Log anxiety level</Text>
              <Text style={styles.cardSubtitle}>Track your mental state</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddEntry(!showAddEntry)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Entry Form */}
        {showAddEntry && (
          <View style={styles.addEntryForm}>
            <Text style={styles.addEntryTitle}>How are you feeling today?</Text>
            
            {/* Rating Selector */}
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    selectedRating === rating && styles.selectedRating
                  ]}
                  onPress={() => setSelectedRating(rating as MoodRating)}
                >
                  <Text style={styles.ratingEmoji}>{getMoodEmoji(rating)}</Text>
                  <Text style={styles.ratingNumber}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.selectedMoodText}>
              {getMoodText(selectedRating)}
            </Text>

            {/* Game Type Selector */}
            <View style={styles.gameTypeContainer}>
              <Text style={styles.gameTypeLabel}>Context (optional):</Text>
              <View style={styles.gameTypeButtons}>
                {(['practice', 'game', 'training'] as GameType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.gameTypeButton,
                      gameType === type && styles.selectedGameType
                    ]}
                    onPress={() => setGameType(gameType === type ? undefined : type)}
                  >
                    <Text style={[
                      styles.gameTypeText,
                      gameType === type && styles.selectedGameTypeText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes Input */}
            <TextInput
              style={styles.notesInput}
              placeholder="Optional: Add notes about your game/practice..."
              placeholderTextColor="#6B7280"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Action Buttons */}
            <View style={styles.entryActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddEntry(false);
                  setNotes('');
                  setSelectedRating(3);
                  setGameType(undefined);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddMoodEntry}
              >
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent History */}
        {moodEntries.length > 0 && (
          <>
            <View style={styles.tomorrowSection}>
              <Text style={styles.tomorrowText}>Recent History</Text>
            </View>

            {moodEntries.slice(0, 5).map((entry, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyEmoji}>{getMoodEmoji(entry.rating)}</Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>{getMoodText(entry.rating)}</Text>
                    <Text style={styles.historyTime}>{formatDate(entry.date)}</Text>
                  </View>
                  {entry.gameType && (
                    <View style={styles.gameTypeBadge}>
                      <Text style={styles.gameTypeBadgeText}>
                        {entry.gameType.charAt(0).toUpperCase() + entry.gameType.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>
                {entry.notes && (
                  <Text style={styles.historyNotes}>{entry.notes}</Text>
                )}
              </View>
            ))}
          </>
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
  chartContainer: {
    marginBottom: 20,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#2A2B5A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chartContent: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  addEntryCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
    color: '#C7D2FE',
  },
  addButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addEntryForm: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  addEntryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  ratingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#3A3B6A',
    flex: 1,
    minHeight: 60,
  },
  selectedRating: {
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  ratingEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  selectedMoodText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  gameTypeContainer: {
    marginBottom: 16,
  },
  gameTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  gameTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  gameTypeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#3A3B6A',
    alignItems: 'center',
  },
  selectedGameType: {
    backgroundColor: '#4F46E5',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  gameTypeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  selectedGameTypeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#3A3B6A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
    backgroundColor: '#3A3B6A',
    color: '#FFFFFF',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#3A3B6A',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tomorrowSection: {
    paddingVertical: 24,
  },
  tomorrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyCard: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3B6A',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  gameTypeBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameTypeBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyNotes: {
    fontSize: 14,
    color: '#D1D5DB',
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 32,
  },
});