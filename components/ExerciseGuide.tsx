import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Wind, Brain, Heart, Play, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';
import { Timer } from './Timer';
import { ExerciseType } from '@/types';

interface ExerciseGuideProps {
  exerciseType: ExerciseType;
  onComplete: (duration: number) => void;
  onCancel: () => void;
}

export function ExerciseGuide({ exerciseType, onComplete, onCancel }: ExerciseGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const exercises = {
    breathing: {
      title: '4-7-8 Breathing',
      description: 'A powerful technique to calm your nervous system',
      icon: Wind,
      color: '#4F46E5',
      duration: 240, // 4 minutes
      steps: [
        {
          title: 'Get Comfortable',
          instruction: 'Sit or stand comfortably with your back straight. Place one hand on your chest and one on your belly.',
          duration: 30,
        },
        {
          title: 'Exhale Completely',
          instruction: 'Breathe out completely through your mouth, making a whoosh sound.',
          duration: 15,
        },
        {
          title: 'Inhale (4 counts)',
          instruction: 'Close your mouth and inhale quietly through your nose for 4 counts.',
          duration: 45,
        },
        {
          title: 'Hold (7 counts)',
          instruction: 'Hold your breath for 7 counts. Stay relaxed.',
          duration: 45,
        },
        {
          title: 'Exhale (8 counts)',
          instruction: 'Exhale completely through your mouth for 8 counts, making a whoosh sound.',
          duration: 45,
        },
        {
          title: 'Repeat Cycle',
          instruction: 'Repeat this cycle 4-6 times. Focus only on your breathing.',
          duration: 60,
        },
      ],
    },
    visualization: {
      title: 'Perfect Play Visualization',
      description: 'Mental rehearsal for peak performance',
      icon: Brain,
      color: '#7C3AED',
      duration: 300, // 5 minutes
      steps: [
        {
          title: 'Relaxation',
          instruction: 'Close your eyes and take 3 deep breaths. Let your body relax completely.',
          duration: 45,
        },
        {
          title: 'Set the Scene',
          instruction: 'Picture yourself on the soccer field. See the grass, feel the air, hear the sounds.',
          duration: 60,
        },
        {
          title: 'Perfect Passes',
          instruction: 'Visualize yourself making accurate, confident passes. See the ball going exactly where you want.',
          duration: 60,
        },
        {
          title: 'Defensive Success',
          instruction: 'See yourself making smart defensive plays, intercepting passes, and winning tackles.',
          duration: 60,
        },
        {
          title: 'Team Connection',
          instruction: 'Imagine positive interactions with teammates. Feel the support and connection.',
          duration: 45,
        },
        {
          title: 'Victory Feeling',
          instruction: 'Experience the joy and satisfaction of playing your best game. Lock in this feeling.',
          duration: 30,
        },
      ],
    },
    heartrate: {
      title: 'Heart Rate Reset',
      description: 'Quick technique to lower anxiety and heart rate',
      icon: Heart,
      color: '#EC4899',
      duration: 180, // 3 minutes
      steps: [
        {
          title: 'Hand Placement',
          instruction: 'Place one hand on your chest and one on your belly. Feel your heartbeat.',
          duration: 20,
        },
        {
          title: 'Slow Breathing',
          instruction: 'Breathe slowly and deeply into your belly, not your chest. Make your belly hand move more.',
          duration: 60,
        },
        {
          title: 'Count Breaths',
          instruction: 'Count each breath cycle. In... 1... Out... 2... Focus only on the counting.',
          duration: 60,
        },
        {
          title: 'Heart Focus',
          instruction: 'Feel your heart rate slowing down. Trust your body\'s natural ability to calm.',
          duration: 40,
        },
      ],
    },
  };

  const exercise = exercises[exerciseType];
  const IconComponent = exercise.icon;
  const totalSteps = exercise.steps.length;

  const handleStart = () => {
    setIsActive(true);
    setStartTime(Date.now());
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    onComplete(duration);
  };

  const handleCancel = () => {
    setIsActive(false);
    setCurrentStep(0);
    setStartTime(null);
    onCancel();
  };

  if (!isActive) {
    return (
      <View style={styles.container}>
        {/* Exercise Overview */}
        <View style={styles.overview}>
          <View style={[styles.iconContainer, { backgroundColor: `${exercise.color}20` }]}>
            <IconComponent size={48} color={exercise.color} />
          </View>
          <Text style={styles.title}>{exercise.title}</Text>
          <Text style={styles.description}>{exercise.description}</Text>
          <Text style={styles.duration}>Duration: ~{Math.floor(exercise.duration / 60)} minutes</Text>
        </View>

        {/* Steps Preview */}
        <ScrollView style={styles.stepsPreview} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepsTitle}>What you'll do:</Text>
          {exercise.steps.map((step, index) => (
            <View key={index} style={styles.stepPreview}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Start Button */}
        <TouchableOpacity style={[styles.startButton, { backgroundColor: exercise.color }]} onPress={handleStart}>
          <Play size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Begin Exercise</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStepData = exercise.steps[currentStep];

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
                backgroundColor: exercise.color 
              }
            ]} 
          />
        </View>
      </View>

      {/* Current Step */}
      <View style={styles.activeStep}>
        <Text style={styles.stepTitleActive}>{currentStepData.title}</Text>
        <Text style={styles.stepInstructionActive}>{currentStepData.instruction}</Text>
        
        {/* Step Timer */}
        <View style={styles.timerContainer}>
          <Timer
            duration={currentStepData.duration}
            onComplete={handleNext}
            showControls={false}
            size="large"
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
          style={[styles.nextButton, { backgroundColor: exercise.color }]} 
          onPress={handleNext}
        >
          {currentStep === totalSteps - 1 ? (
            <>
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.nextButtonText}>Complete</Text>
            </>
          ) : (
            <>
              <ArrowRight size={20} color="#FFFFFF" />
              <Text style={styles.nextButtonText}>Next Step</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
    padding: 20,
  },
  overview: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  iconContainer: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  stepsPreview: {
    flex: 1,
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  stepPreview: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  stepInstruction: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  progressHeader: {
    marginBottom: 40,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  activeStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stepTitleActive: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepInstructionActive: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  timerContainer: {
    marginVertical: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    paddingHorizontal: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});