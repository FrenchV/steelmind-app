import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, TrendingDown, Target, Award, Calendar, Activity } from 'lucide-react-native';
import { MoodEntry, ExerciseSession, RoutineSession } from '@/types';

interface ProgressInsightsProps {
  moodEntries: MoodEntry[];
  exerciseSessions: ExerciseSession[];
  routineSessions: RoutineSession[];
}

export function ProgressInsights({ moodEntries, exerciseSessions, routineSessions }: ProgressInsightsProps) {
  // Calculate comprehensive insights
  const calculateInsights = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Mood insights
    const thisWeekMoods = moodEntries.filter(entry => new Date(entry.date) >= oneWeekAgo);
    const lastWeekMoods = moodEntries.filter(entry => {
      const date = new Date(entry.date);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });
    const thisMonthMoods = moodEntries.filter(entry => new Date(entry.date) >= oneMonthAgo);

    const thisWeekAvg = thisWeekMoods.length > 0 
      ? thisWeekMoods.reduce((sum, entry) => sum + entry.rating, 0) / thisWeekMoods.length 
      : 0;
    const lastWeekAvg = lastWeekMoods.length > 0 
      ? lastWeekMoods.reduce((sum, entry) => sum + entry.rating, 0) / lastWeekMoods.length 
      : 0;

    // Exercise insights
    const thisWeekExercises = exerciseSessions.filter(session => 
      session.completed && new Date(session.startTime) >= oneWeekAgo
    );
    const lastWeekExercises = exerciseSessions.filter(session => {
      const date = new Date(session.startTime);
      return session.completed && date >= twoWeeksAgo && date < oneWeekAgo;
    });

    // Routine insights
    const thisWeekRoutines = routineSessions.filter(session => 
      session.completed && new Date(session.date) >= oneWeekAgo
    );
    const lastWeekRoutines = routineSessions.filter(session => {
      const date = new Date(session.date);
      return session.completed && date >= twoWeeksAgo && date < oneWeekAgo;
    });

    // Calculate streaks
    const moodStreak = calculateMoodStreak();
    const exerciseStreak = calculateExerciseStreak();

    // Correlation analysis
    const routineImpact = calculateRoutineImpact();

    return {
      thisWeekAvg,
      lastWeekAvg,
      moodTrend: thisWeekAvg > lastWeekAvg ? 'improving' : thisWeekAvg < lastWeekAvg ? 'declining' : 'stable',
      thisWeekExercises: thisWeekExercises.length,
      lastWeekExercises: lastWeekExercises.length,
      thisWeekRoutines: thisWeekRoutines.length,
      lastWeekRoutines: lastWeekRoutines.length,
      moodStreak,
      exerciseStreak,
      routineImpact,
      totalActivities: moodEntries.length + exerciseSessions.filter(s => s.completed).length + routineSessions.filter(r => r.completed).length,
      monthlyProgress: thisMonthMoods.length,
    };
  };

  const calculateMoodStreak = () => {
    let streak = 0;
    const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      // Check if entry is within 1 day of expected date
      const diffTime = Math.abs(entryDate.getTime() - expectedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateExerciseStreak = () => {
    const exerciseDates = exerciseSessions
      .filter(session => session.completed)
      .map(session => new Date(session.startTime).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    for (let i = 0; i < exerciseDates.length; i++) {
      const exerciseDate = new Date(exerciseDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      const diffTime = Math.abs(exerciseDate.getTime() - expectedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateRoutineImpact = () => {
    const routineDates = routineSessions
      .filter(session => session.completed)
      .map(session => session.date);

    const moodsAfterRoutines = moodEntries.filter(mood => {
      return routineDates.some(routineDate => {
        const moodDate = new Date(mood.date);
        const rDate = new Date(routineDate);
        const diffTime = moodDate.getTime() - rDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 1; // Same day or next day
      });
    });

    const moodsWithoutRoutines = moodEntries.filter(mood => {
      return !routineDates.some(routineDate => {
        const moodDate = new Date(mood.date);
        const rDate = new Date(routineDate);
        const diffTime = Math.abs(moodDate.getTime() - rDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 1;
      });
    });

    if (moodsAfterRoutines.length === 0 || moodsWithoutRoutines.length === 0) {
      return null;
    }

    const avgWithRoutine = moodsAfterRoutines.reduce((sum, mood) => sum + mood.rating, 0) / moodsAfterRoutines.length;
    const avgWithoutRoutine = moodsWithoutRoutines.reduce((sum, mood) => sum + mood.rating, 0) / moodsWithoutRoutines.length;

    return {
      withRoutine: avgWithRoutine,
      withoutRoutine: avgWithoutRoutine,
      improvement: avgWithRoutine - avgWithoutRoutine,
    };
  };

  const insights = calculateInsights();

  const getInsightCards = () => {
    const cards = [];

    // Mood trend card
    cards.push({
      id: 'mood-trend',
      title: 'Weekly Mood Trend',
      icon: insights.moodTrend === 'improving' ? TrendingUp : insights.moodTrend === 'declining' ? TrendingDown : Target,
      color: insights.moodTrend === 'improving' ? '#16A34A' : insights.moodTrend === 'declining' ? '#EF4444' : '#6B7280',
      value: insights.thisWeekAvg.toFixed(1),
      subtitle: `${insights.moodTrend === 'improving' ? '+' : insights.moodTrend === 'declining' ? '' : ''}${(insights.thisWeekAvg - insights.lastWeekAvg).toFixed(1)} from last week`,
      description: insights.moodTrend === 'improving' 
        ? 'Your anxiety levels are improving! Keep using your tools.'
        : insights.moodTrend === 'declining'
        ? 'Focus on your exercises and pre-game routines this week.'
        : 'Your mood has been stable. Consistency is key!',
    });

    // Activity trend card
    const activityChange = insights.thisWeekExercises - insights.lastWeekExercises;
    cards.push({
      id: 'activity-trend',
      title: 'Exercise Activity',
      icon: Activity,
      color: activityChange >= 0 ? '#16A34A' : '#F59E0B',
      value: insights.thisWeekExercises.toString(),
      subtitle: `${activityChange >= 0 ? '+' : ''}${activityChange} from last week`,
      description: activityChange > 0 
        ? 'Great job increasing your exercise sessions!'
        : activityChange < 0
        ? 'Try to maintain consistent exercise practice.'
        : 'You maintained your exercise routine well.',
    });

    // Streak card
    if (insights.moodStreak > 0 || insights.exerciseStreak > 0) {
      const bestStreak = Math.max(insights.moodStreak, insights.exerciseStreak);
      const streakType = insights.moodStreak > insights.exerciseStreak ? 'mood tracking' : 'exercise';
      
      cards.push({
        id: 'streak',
        title: 'Current Streak',
        icon: Award,
        color: '#F59E0B',
        value: `${bestStreak} days`,
        subtitle: `${streakType} streak`,
        description: bestStreak >= 7 
          ? 'Amazing consistency! You\'re building strong mental habits.'
          : 'Keep going! Consistency builds mental strength.',
      });
    }

    // Routine impact card
    if (insights.routineImpact && insights.routineImpact.improvement > 0) {
      cards.push({
        id: 'routine-impact',
        title: 'Routine Impact',
        icon: Target,
        color: '#8B5CF6',
        value: `+${insights.routineImpact.improvement.toFixed(1)}`,
        subtitle: 'mood improvement with routines',
        description: 'Your pre-game routines are making a real difference!',
      });
    }

    return cards;
  };

  const insightCards = getInsightCards();

  if (insights.totalActivities < 3) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Calendar size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Building Your Insights</Text>
          <Text style={styles.emptyText}>
            Keep logging moods and doing exercises to unlock personalized insights about your mental game progress.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress Insights</Text>
        <Text style={styles.subtitle}>Data-driven insights to boost your mental game</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {insightCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <View key={card.id} style={styles.insightCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                    <IconComponent size={24} color={card.color} />
                  </View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Journey So Far</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{insights.totalActivities}</Text>
              <Text style={styles.summaryLabel}>Total Activities</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{insights.monthlyProgress}</Text>
              <Text style={styles.summaryLabel}>This Month</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.max(insights.moodStreak, insights.exerciseStreak)}</Text>
              <Text style={styles.summaryLabel}>Best Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#3A3B6A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A4B7A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    paddingLeft: 44,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 4,
    fontWeight: '500',
  },
});