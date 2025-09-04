import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MoodEntry } from '@/types';

interface MoodChartProps {
  moodEntries: MoodEntry[];
  showTrend?: boolean;
  maxEntries?: number;
}

export function MoodChart({ moodEntries, showTrend = true, maxEntries = 7 }: MoodChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for padding
  const chartHeight = 120;
  
  // Get the most recent entries up to maxEntries
  const recentEntries = moodEntries.slice(-maxEntries);
  
  if (recentEntries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No mood data yet</Text>
        <Text style={styles.emptySubtext}>Start tracking your mood to see trends</Text>
      </View>
    );
  }

  // Calculate positions for mood points
  const points = recentEntries.map((entry, index) => {
    const x = (index / Math.max(recentEntries.length - 1, 1)) * chartWidth;
    const y = chartHeight - (entry.mood / 10) * chartHeight;
    return { x, y, mood: entry.mood, date: entry.date };
  });

  // Calculate trend
  const trend = recentEntries.length > 1 ? 
    recentEntries[recentEntries.length - 1].mood - recentEntries[0].mood : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Trend</Text>
        {showTrend && (
          <View style={[styles.trendBadge, trend >= 0 ? styles.trendUp : styles.trendDown]}>
            <Text style={styles.trendText}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
        {/* Grid lines */}
        {[2, 4, 6, 8].map(value => (
          <View
            key={value}
            style={[
              styles.gridLine,
              { top: chartHeight - (value / 10) * chartHeight }
            ]}
          />
        ))}
        
        {/* Mood points */}
        {points.map((point, index) => (
          <View key={index}>
            {/* Line to next point */}
            {index < points.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    left: point.x,
                    top: point.y,
                    width: Math.sqrt(
                      Math.pow(points[index + 1].x - point.x, 2) +
                      Math.pow(points[index + 1].y - point.y, 2)
                    ),
                    transform: [{
                      rotate: `${Math.atan2(
                        points[index + 1].y - point.y,
                        points[index + 1].x - point.x
                      )}rad`
                    }]
                  }
                ]}
              />
            )}
            
            {/* Mood point */}
            <View
              style={[
                styles.point,
                {
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: getMoodColor(point.mood)
                }
              ]}
            />
          </View>
        ))}
      </View>
      
      {/* Labels */}
      <View style={styles.labels}>
        <Text style={styles.labelText}>Poor</Text>
        <Text style={styles.labelText}>Excellent</Text>
      </View>
    </View>
  );
}

function getMoodColor(mood: number): string {
  if (mood <= 3) return '#EF4444'; // Red
  if (mood <= 5) return '#F59E0B'; // Orange
  if (mood <= 7) return '#EAB308'; // Yellow
  return '#10B981'; // Green
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2B5A',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  trendDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chart: {
    position: 'relative',
    marginBottom: 12,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#4F46E5',
    transformOrigin: '0 50%',
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});