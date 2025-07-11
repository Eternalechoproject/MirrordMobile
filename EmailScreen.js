import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function EmailScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleContinue = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // Save email locally
      await AsyncStorage.setItem('userEmail', email.toLowerCase());
      
      // Navigate to name screen
      navigation.navigate('Name', { email: email.toLowerCase() });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <ImageBackground 
      source={require('./assets/Mainlogo1.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to MIRRORD</Text>
            <Text style={styles.subtitle}>
              Enter your email to start your 7-day free trial
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
            />

            <TouchableOpacity 
              style={[styles.button, (!email || loading) && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!email || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : 'Start Free Trial'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Free for 7 days, then $4.99/month.{'\n'}
              Cancel anytime. No credit card required for trial.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => Alert.alert('Coming Soon', 'Login for existing users coming soon!')}
          >
            <Text style={styles.loginText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 18,
    borderRadius: 25,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#ffd700',
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  loginLink: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  loginText: {
    color: '#ffd700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});