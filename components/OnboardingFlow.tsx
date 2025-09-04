import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, ArrowLeft, Target, Heart, Brain, CircleCheck as CheckCircle } from 'lucide-react-native';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Soccer Mindset Coach! ⚽',
      subtitle: 'Your mental performance companion',
      content: 'This app helps soccer players manage performance anxiety through proven mental techniques, progress tracking, and pre-game routines.',
      icon: Target,
      color: '#16A34A',
    },
    {
      id: 'mood-tracking',
      title: 'Track Your Mental State 📊',
      subtitle: 'Build self-awareness',
      content: 'Log your anxiety levels daily to understand patterns and see your progress over time. Awareness is the first step to improvement.',
      icon: Heart,
      color: '#3B82F6',
    },
    {
      id: 'exercises',
      title: 'Quick Relief Tools 🧘‍♂️',
      subtitle: 'Calm your nerves instantly',
      content: 'Access breathing exercises, visualization techniques, and heart rate reset tools whenever you feel anxious or overwhelmed.',
      icon: Brain,
      color: '#8B5CF6',
    },
    {
      id: 'routines',
      title: 'Pre-Game Routines 🎯',
      subtitle: 'Prepare for peak performance',
      content: 'Follow guided 15-minute pre-game routines to mentally prepare for matches. Consistency builds confidence.',
      icon: CheckCircle,
      color: '#F59E0B',
    },
    {
      id: 'ready',
      title: 'You\'re Ready to Start! 🚀',
      subtitle: 'Your mental game journey begins now',
      content: 'Remember: Every professional athlete works on their mental game. You\'re taking the same steps as the pros. Let\'s build that unshakeable confidence!',
      icon: Target,
      color: '#16A34A',
    },
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                  backgroundColor: currentStepData.color 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Step Content */}
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${currentStepData.color}20` }]}>
              <IconComponent size={48} color={currentStepData.color} />
            </View>
            
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.stepDescription}>{currentStepData.content}</Text>
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={styles.navigationButtons}>
            {currentStep > 0 ? (
              <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
                <ArrowLeft size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.nextButton, { backgroundColor: currentStepData.color }]} 
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'Get Started' : 'Next'}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 60,
    textAlign: 'right',
  },
  stepContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  navigation: {
    paddingVertical: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});