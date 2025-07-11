import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

// Mood Screen
export function MoodScreen({ navigation, route }) {
  const [mood, setMood] = useState(5);
  
  return (
    <View style={styles.container}>
      <Text style={styles.question}>How are you feeling?</Text>
      <Text style={styles.moodValue}>{mood} / 10</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        value={mood}
        onValueChange={setMood}
        step={1}
        minimumTrackTintColor="#ffd700"
        maximumTrackTintColor="#333"
        thumbTintColor="#ffd700"
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Goal', { 
          name: route.params.name,
          mood: mood,
          email: route.params.email 
        })}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

// Goal Screen
export function GoalScreen({ navigation, route }) {
  const goals = [
    { id: 'confidence', title: 'Test Confidence' },
    { id: 'clarity', title: 'Get Clarity' },
    { id: 'anxiety', title: 'Reduce Anxiety' },
    { id: 'sadness', title: 'Handle Sadness' },
    { id: 'anger', title: 'Deal with Anger' },
    { id: 'past', title: 'Stuck in the Past' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What do you want to test?</Text>
      <View style={styles.goalsContainer}>
        {goals.map(goal => (
          <TouchableOpacity
            key={goal.id}
            style={styles.goalCard}
            onPress={() => navigation.navigate('Chat', { 
              name: route.params.name,
              mood: route.params.mood,
              goal: goal.id,
              email: route.params.email
            })}
          >
            <Text style={styles.goalText}>{goal.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  question: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  moodValue: {
    color: '#ffd700',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalsContainer: {
    width: '100%',
  },
  goalCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  goalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});