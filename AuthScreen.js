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
  Alert,
  ActivityIndicator
} from 'react-native';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Simple email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAuth = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      let userCredential;
      
      if (isLogin) {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email.toLowerCase(),
          createdAt: new Date().toISOString(),
          subscriptionTier: 'free',
          trialStartDate: new Date().toISOString()
        });
      }

      // Save user ID locally
      await AsyncStorage.setItem('userId', userCredential.user.uid);
      await AsyncStorage.setItem('userEmail', email.toLowerCase());
      
      // Navigate to name screen
      navigation.navigate('Name', { 
        email: email.toLowerCase(),
        userId: userCredential.user.uid 
      });
      
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle specific errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          Alert.alert('Email Taken', 'This email is already registered. Try logging in.');
          break;
        case 'auth/user-not-found':
          Alert.alert('User Not Found', 'No account found with this email. Try signing up.');
          break;
        case 'auth/wrong-password':
          Alert.alert('Invalid Password', 'The password is incorrect.');
          break;
        case 'auth/weak-password':
          Alert.alert('Weak Password', 'Password should be at least 6 characters.');
          break;
        default:
          Alert.alert('Error', 'Something went wrong. Please try again.');
      }
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
              {isLogin 
                ? 'Sign in to continue your journey' 
                : 'Create an account to start your 7-day free trial'
              }
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

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#666"
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Sign In' : 'Start Free Trial'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimer}>
                {isLogin 
                  ? '' 
                  : 'Free for 7 days, then $4.99-$19.99/month.\nCancel anytime.'
                }
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Log in'
                }
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => navigation.navigate('Landing')}
          >
            <Text style={styles.skipText}>← Back</Text>
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
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  disclaimerContainer: {
    marginBottom: 20,
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  switchButton: {
    padding: 10,
    alignSelf: 'center',
  },
  switchText: {
    color: '#ffd700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    left: 30,
  },
  skipText: {
    color: '#ffd700',
    fontSize: 16,
  },
});