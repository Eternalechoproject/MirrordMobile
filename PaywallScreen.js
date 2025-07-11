import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Linking,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export function PaywallScreen({ navigation, route }) {
  const { trialEnded, messagesUsedToday } = route.params || {};
  
  // For now, using Stripe payment link (replace with RevenueCat later)
  const handleSubscribe = () => {
    // Replace with your actual Stripe payment link
    Linking.openURL('https://buy.stripe.com/your-payment-link-here');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon/Logo */}
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {trialEnded ? 'Your free trial has ended' : 'Unlock unlimited conversations'}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {trialEnded 
            ? `You've used ${messagesUsedToday}/5 messages today. Upgrade to continue.`
            : 'Get unlimited access to MIRRORD\'s mental clarity conversations'
          }
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <BenefitRow icon="♾️" text="Unlimited messages every day" />
          <BenefitRow icon="🚀" text="Priority response times" />
          <BenefitRow icon="🧠" text="Advanced conversation memory" />
          <BenefitRow icon="🔓" text="Access to all conversation topics" />
          <BenefitRow icon="❌" text="No ads, no interruptions" />
        </View>

        {/* Pricing Box */}
        <LinearGradient
          colors={['#ffd700', '#ffed4e']}
          style={styles.pricingBox}
        >
          <Text style={styles.priceLabel}>MIRRORD PRO</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>4.99</Text>
            <Text style={styles.period}>/month</Text>
          </View>
          {!trialEnded && (
            <Text style={styles.trialText}>Start with 7-day free trial</Text>
          )}
        </LinearGradient>

        {/* Subscribe Button */}
        <TouchableOpacity 
          style={styles.subscribeButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeText}>
            {trialEnded ? 'Subscribe Now' : 'Start Free Trial'}
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          {trialEnded 
            ? 'Cancel anytime. Billed monthly.'
            : 'Free for 7 days, then $4.99/month. Cancel anytime.'
          }
        </Text>

        {/* Restore Purchase */}
        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={() => {/* Add restore logic */}}
        >
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function BenefitRow({ icon, text }) {
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  lockIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  pricingBox: {
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  price: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000',
  },
  period: {
    fontSize: 18,
    color: '#000',
    marginLeft: 5,
  },
  trialText: {
    fontSize: 14,
    color: '#000',
    marginTop: 10,
    fontWeight: '600',
  },
  subscribeButton: {
    backgroundColor: '#ffd700',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 20,
  },
  subscribeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  terms: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 30,
  },
  restoreButton: {
    padding: 10,
  },
  restoreText: {
    color: '#ffd700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});