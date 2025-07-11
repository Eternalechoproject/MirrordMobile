import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  ImageBackground,
  Dimensions,
  SafeAreaView,
  Keyboard,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MoodScreen, GoalScreen } from './screens';

const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');
const API_URL = 'https://mirrord1.vercel.app/api';

// All prompts - 10 for each category
const promptSets = {
  confidence: [
    "What moment recently made you feel weak — and why?",
    "Where are you holding back out of fear of failure?",
    "What would you do if you stopped doubting yourself for 24 hours?",
    "What's one area where you're playing small on purpose?",
    "What's something you pretend doesn't matter — but does?",
    "Where are you showing up like a shadow instead of a threat?",
    "What would break loose if you stopped waiting for permission?",
    "What part of your life is overdue for dominance?",
    "What standard are you secretly afraid to rise to?",
    "When did you last disappoint yourself by staying quiet?"
  ],
  clarity: [
    "What part of your life feels murky? Be blunt.",
    "What truth are you avoiding right now?",
    "If someone followed you for a week, what would confuse them most about your choices?",
    "Where are your actions not matching your goals?",
    "What's one thing you keep doing that no longer makes sense?",
    "What part of your story no longer feels true?",
    "If your life was a mission — what's the target you're not aiming at?",
    "What are you pretending not to see?",
    "What's one decision you've been dodging for too long?",
    "What would happen if you actually got brutally honest today?"
  ],
  anxiety: [
    "What's the background noise in your head that won't shut up?",
    "What's the one fear that's overstayed its welcome?",
    "If your mind had a volume knob, what thought is blasting right now?",
    "What outcome are you trying to control too much?",
    "What threat are you preparing for that hasn't happened?",
    "What's stealing your peace the moment you wake up?",
    "What's something you're scared will break — even if it's fine?",
    "What's one truth you keep resisting because it scares you?",
    "Where is your nervous system stuck in fight mode for no reason?",
    "What fear keeps growing because you won't look at it?"
  ],
  sadness: [
    "What's been slowly wearing you down, even if you don't talk about it?",
    "What loss haven't you properly faced yet?",
    "What part of you feels like it went missing?",
    "What's a weight you carry that no one sees?",
    "When did you start faking okay?",
    "What are you grieving that never got a funeral?",
    "What version of you do you secretly miss?",
    "What's the wound you keep walking on like it's healed?",
    "When did you stop expecting good things to last?",
    "What do you mourn that you've never said out loud?"
  ],
  anger: [
    "What's been pissing you off that you haven't said out loud?",
    "What injustice keeps burning in your chest?",
    "Who or what deserves your rage right now?",
    "What boundary violation still makes your blood boil?",
    "What are you pretending you're not furious about?",
    "What would you destroy if there were no consequences?",
    "What truth are you too angry to speak?",
    "What's the real target of your anger?",
    "What fight are you avoiding that needs to happen?",
    "What makes you want to burn it all down?"
  ],
  past: [
    "What moment from your past still owns you?",
    "What old version of yourself won't let go?",
    "What story from back then still runs your life?",
    "What wound from the past is still bleeding?",
    "What ghost are you still trying to impress?",
    "What failure still defines you years later?",
    "What door from the past won't stay closed?",
    "What younger you still makes your decisions?",
    "What old shame still controls your moves?",
    "What yesterday are you still living in?"
  ]
};



// Enhanced Landing Screen with all desktop sections
function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <ImageBackground 
          source={require('./assets/Mainlogo1.png')} 
          style={styles.heroSection}
          resizeMode="contain"
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Mental clarity{'\n'}without the fluff.</Text>
            <Text style={styles.heroSubtitle}>A grounded space for men who don't usually talk.</Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Name')}
            >
              <Text style={styles.ctaButtonText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Built Different Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built different.</Text>
          <Text style={styles.sectionSubtitle}>
            MIRRORD listens without judgment. No therapy speak. Just real conversation.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🤝</Text>
              <Text style={styles.featureTitle}>Human Tone</Text>
              <Text style={styles.featureText}>
                Like talking to a guy who's been through it. No buzzwords, no clichés.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureTitle}>Direct Approach</Text>
              <Text style={styles.featureText}>
                Short responses that actually help. No endless analysis or fake wisdom.
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureTitle}>Zero Judgment</Text>
              <Text style={styles.featureText}>
                Say what you need to say. Get heard without the moral lectures.
              </Text>
            </View>
          </View>
        </View>

        {/* Simple Process Section */}
        <View style={[styles.section, styles.darkSection]}>
          <Text style={styles.sectionTitle}>Simple Process</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Pick Your Focus</Text>
              <Text style={styles.stepText}>
                Confidence, clarity, anxiety, or whatever's on your mind.
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Have a Real Talk</Text>
              <Text style={styles.stepText}>
                No scripts. Just say what you're thinking.
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Get Perspective</Text>
              <Text style={styles.stepText}>
                Clear, honest responses that help you see things differently.
              </Text>
            </View>
          </View>
        </View>

        {/* Why MIRRORD Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why MIRRORD works</Text>
          
          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.mirrordCell]}>MIRRORD</Text>
              <Text style={styles.tableCell}>Other apps</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.mirrordCell]}>Real talk</Text>
              <Text style={styles.tableCell}>Therapy speak</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.mirrordCell]}>Grounded tone</Text>
              <Text style={styles.tableCell}>Fake positivity</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.mirrordCell]}>Quick clarity</Text>
              <Text style={styles.tableCell}>Endless journaling</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.mirrordCell]}>No judgment</Text>
              <Text style={styles.tableCell}>Moral lectures</Text>
            </View>
          </View>
        </View>

        {/* Footer CTA */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>Ready to talk?</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Name')}
          >
            <Text style={styles.ctaButtonText}>Start Conversation →</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Links Section */}
        <View style={styles.legalSection}>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://mirrord1.vercel.app/legal.html#terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://mirrord1.vercel.app/legal.html#privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://mirrord1.vercel.app/legal.html#disclaimer')}>
              <Text style={styles.legalLink}>Medical Disclaimer</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.copyright}>© 2024 MIRRORD LLC. All rights reserved.</Text>
        </View>

        <StatusBar style="light" />
      </ScrollView>
    </SafeAreaView>
  );
}

// Name Screen
function NameScreen({ navigation }) {
  const [name, setName] = useState('');
  
  return (
    <ImageBackground 
      source={require('./assets/Mainlogo1.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.question}>What should I call you?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#666"
          autoFocus={true}
        />
        <TouchableOpacity 
          style={[styles.button, !name && styles.buttonDisabled]}
          onPress={() => name && navigation.navigate('Mood', { name })}
          disabled={!name}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// Claude-style Chat Screen
function ChatScreen({ route, navigation }) {
  const { name, mood, goal } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);


  // Initialize with prompt
  useEffect(() => {
    const prompts = promptSets[goal] || promptSets.clarity;
    const initialPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setMessages([{ id: 1, text: initialPrompt, user: false }]);
  }, [goal]);

  // Auto scroll when messages update
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    
    // Dismiss keyboard immediately
    Keyboard.dismiss();
    
    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, user: true }]);
    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.user ? 'user' : 'assistant',
        content: msg.text
      }));
      conversationHistory.push({ role: 'user', content: userMessage });

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: conversationHistory,
          username: name,
          mood,
          goal 
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: data.reply || "I hear you. Tell me more about that.", 
        user: false 
      }]);
      

      
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Something went wrong. Want to try that again?", 
        user: false 
      }]);
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.chatContainer}>
      <SafeAreaView style={styles.chatSafeArea}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
            <Text style={styles.exitButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.messagesContainer}
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg => (
            <View key={msg.id} style={[
              styles.messageBubble,
              msg.user ? styles.userBubble : styles.botBubble
            ]}>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={styles.messageText}>...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Claude-style input bar */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Reply to MIRRORD..."
              placeholderTextColor="#999"
              multiline
              returnKeyType="default"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (message.trim()) sendMessage();
              }}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!message.trim() || loading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!message.trim() || loading}
            >
              <Text style={styles.sendButtonText}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="Mood" component={MoodScreen} />
        <Stack.Screen name="Goal" component={GoalScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Base containers
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  
  // Hero Section
  heroSection: {
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 48,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  
  // Sections
  section: {
    padding: 30,
    paddingVertical: 60,
  },
  darkSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  
  // Feature Cards
  featuresContainer: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffd700',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  
  // Steps
  stepsContainer: {
    gap: 30,
  },
  step: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffd700',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // Comparison Table
  comparisonTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    flex: 1,
    padding: 15,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  mirrordCell: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    color: '#00d4ff',
    fontWeight: '700',
  },
  
  // Footer
  footerSection: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  footerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 30,
  },
  
  // CTA Button
  ctaButton: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Legal Section
  legalSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  legalLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
    paddingHorizontal: 5,
  },
  legalSeparator: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 14,
    paddingHorizontal: 5,
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  
  // Form styles
  question: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 25,
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  // Claude-style Chat
  chatContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  chatSafeArea: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 5 : 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  exitButton: {
    color: '#fff',
    fontSize: 18,
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#8E8E93', // Gray instead of blue
    alignSelf: 'flex-end',
    marginLeft: 60,
  },
  botBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    marginRight: 60,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  
  // Claude-style keyboard input
  keyboardAvoidingView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  inputWrapper: {
    backgroundColor: '#000',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: Platform.OS === 'ios' ? 0 : 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: '#fff',
    maxHeight: 120,
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Gray border
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000', // Black background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // White border
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    color: '#fff', // White arrow
    fontSize: 18,
    fontWeight: '600',
  },
});