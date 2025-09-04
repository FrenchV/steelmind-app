import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CircleCheck as CheckCircle, Circle, Play, ArrowRight, RotateCcw } from 'lucide-react-native';
import { Timer } from './Timer';
import { RoutineStep } from '@/types';

interface RoutineFlowProps {
  steps: RoutineStep[];
  completedSteps: string[];
  onStepComplete: (stepId: string) => void;
  onStepUncomplete: (stepId: string) => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function RoutineFlow({ 
  steps, 
  completedSteps, 
  onStepComplete, 
  onStepUncomplete,
  onComplete,
  onCancel 
}: RoutineFlowProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [flowStarted, setFlowStarted] = useState(false);

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const completedCount = completedSteps.length;
  const progressPercentage = (completedCount / steps.length) * 100;
  const isFullyCompleted = completedCount === steps.length;

  // Auto-advance to next incomplete step
  useEffect(() => {
    if (flowStarted && activeStepIndex !== null) {
      const currentStep = steps[activeStepIndex];
      if (isStepCompleted(currentStep.id)) {
        // Find next incomplete step
        const nextIncompleteIndex = steps.findIndex((step, index) => 
          index > activeStepIndex && !isStepCompleted(step.id)
        );
        
        if (nextIncompleteIndex !== -1) {
          setActiveStepIndex(nextIncompleteIndex);
        } else {
          // All steps completed
          setActiveStepIndex(null);
          setFlowStarted(false);
          onComplete();
        }
      }
    }
  }, [completedSteps, activeStepIndex, flowStarted, steps, isStepCompleted, onComplete]);

  const startFlow = () => {
    setFlowStarted(true);
    // Start with first incomplete step
    const firstIncompleteIndex = steps.findIndex(step => !isStepCompleted(step.id));
    setActiveStepIndex(firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0);
  };

  const startSpecificStep = (index: number) => {
    setActiveStepIndex(index);
    setFlowStarted(true);
  };

  const handleStepComplete = () => {
    if (activeStepIndex !== null) {
      const currentStep = steps[activeStepIndex];
      onStepComplete(currentStep.id);
    }
  };

  const handleCancel = () => {
    setActiveStepIndex(null);
    setFlowStarted(false);
    onCancel();
  };

  const getStepIcon = (iconName: string) => {
    // This would normally import the actual icons, but for simplicity using a default
    return Circle;
  };

  // If showing active step
  if (activeStepIndex !== null) {
    const currentStep = steps[activeStepIndex];
    const IconComponent = getStepIcon(currentStep.icon);
    
    return (
      <View style={styles.activeStepContainer}>
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Step {activeStepIndex + 1} of {steps.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
            />
          </View>
        </View>

        {/* Step Content */}
        <View style={styles.stepContent}>
          <View style={[styles.stepIcon, { backgroundColor: `${currentStep.color}20` }]}>
            <IconComponent size={32} color={currentStep.color} />
          </View>
          
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepDescription}>{currentStep.description}</Text>
          
          {/* Step Instructions */}
          <ScrollView style={styles.instructionsScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            {currentStep.details.map((detail, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionBullet}>•</Text>
                <Text style={styles.instructionText}>{detail}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Timer
              duration={currentStep.estimatedDuration}
              onComplete={handleStepComplete}
              size="medium"
              autoStart={true}
            />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: currentStep.color }]}
            onPress={handleStepComplete}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Overview mode
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pre-Game Routine</Text>
        <Text style={styles.subtitle}>
          {isFullyCompleted 
            ? 'Completed! You\'re ready to dominate! 🔥'
            : `${completedCount}/${steps.length} steps completed`
          }
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
      </View>

      {/* Start Flow Button */}
      {!isFullyCompleted && (
        <TouchableOpacity style={styles.startFlowButton} onPress={startFlow}>
          <Play size={20} color="#FFFFFF" />
          <Text style={styles.startFlowText}>
            {completedCount === 0 ? 'Begin Routine' : 'Continue Routine'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Steps List */}
      <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
        {steps.map((step, index) => {
          const IconComponent = getStepIcon(step.icon);
          const isCompleted = isStepCompleted(step.id);
          
          return (
            <View key={step.id} style={[styles.stepCard, isCompleted && styles.completedStepCard]}>
              <View style={styles.stepHeader}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => {
                    if (isCompleted) {
                      onStepUncomplete(step.id);
                    } else {
                      onStepComplete(step.id);
                    }
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={24} color="#16A34A" />
                  ) : (
                    <Circle size={24} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
                
                <View style={[styles.stepIconSmall, { backgroundColor: `${step.color}20` }]}>
                  <IconComponent size={20} color={step.color} />
                </View>
                
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepTitleSmall, isCompleted && styles.completedText]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescriptionSmall}>{step.description}</Text>
                  <Text style={styles.stepDuration}>{step.duration}</Text>
                </View>
              </View>

              {/* Start Step Button */}
              {!isCompleted && (
                <TouchableOpacity
                  style={styles.startStepButton}
                  onPress={() => startSpecificStep(index)}
                >
                  <Play size={16} color={step.color} />
                  <Text style={[styles.startStepText, { color: step.color }]}>
                    Start This Step
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Completion Message */}
      {isFullyCompleted && (
        <View style={styles.completionCard}>
          <Text style={styles.completionEmoji}>🏆</Text>
          <Text style={styles.completionTitle}>Routine Complete!</Text>
          <Text style={styles.completionText}>
            You've prepared your mind for success. Step onto that field with confidence!
          </Text>
          <TouchableOpacity 
            style={styles.resetRoutineButton}
            onPress={() => {
              steps.forEach(step => onStepUncomplete(step.id));
            }}
          >
            <RotateCcw size={16} color="#3B82F6" />
            <Text style={styles.resetRoutineText}>Start New Routine</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activeStepContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  progressHeader: {
    marginBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    minWidth: 40,
    textAlign: 'right',
  },
  startFlowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  startFlowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  stepsList: {
    flex: 1,
  },
  stepCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedStepCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  stepIconSmall: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  stepDescriptionSmall: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  stepDuration: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  startStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    gap: 6,
  },
  startStepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionsScroll: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  instructionBullet: {
    fontSize: 16,
    color: '#16A34A',
    marginRight: 8,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  timerContainer: {
    marginVertical: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  completeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completionCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  resetRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    gap: 6,
  },
  resetRoutineText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
});