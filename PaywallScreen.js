import React, { useState } from 'react';
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
  const { trialEnded, messagesUsedToday, currentTier } = route.params || {};
  const [selectedTier, setSelectedTier] = useState('pro'); // Default to pro as "most popular"
  
  const tiers = {
    basic: {
      name: 'Basic',
      price: '$4.99',
      period: '/month',
      features: [
        'Unlimited messages',
        'All conversation topics',
        'No ads',
        'Basic support'
      ],
      notIncluded: ['Memory & context', 'Progress tracking', 'Weekly summaries'],
      stripeLink: 'https://buy.stripe.com/your-basic-link'
    },
    pro: {
      name: 'Pro',
      price: '$12.99',
      period: '/month',
      badge: 'MOST POPULAR',
      features: [
        'Everything in Basic',
        '✨ Continuous memory',
        '✨ Picks up where you left off',
        '✨ Progress tracking',
        'Priority support'
      ],
      highlight: true,
      stripeLink: 'https://buy.stripe.com/your-pro-link'
    },
    premium: {
      name: 'Premium',
      price: '$19.99',
      period: '/month',
      features: [
        'Everything in Pro',
        '📊 Weekly progress summaries',
        '📊 Export your journey',
        '📊 Advanced insights',
        'VIP support'
      ],
      stripeLink: 'https://buy.stripe.com/your-premium-link'
    }
  };

  const handleSubscribe = () => {
    const tier = tiers[selectedTier];
    Linking.openURL(tier.stripeLink);
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
        {/* Title */}
        <Text style={styles.title}>
          {trialEnded ? 'Choose Your Plan' : 'Unlock Your Full Potential'}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {trialEnded 
            ? `You've used ${messagesUsedToday}/5 messages today`
            : 'Start your 7-day free trial'
          }
        </Text>

        {/* Tier Cards */}
        <View style={styles.tiersContainer}>
          {Object.entries(tiers).map(([key, tier]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.tierCard,
                selectedTier === key && styles.tierCardSelected,
                tier.highlight && styles.tierCardHighlight
              ]}
              onPress={() => setSelectedTier(key)}
            >
              {tier.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{tier.badge}</Text>
                </View>
              )}

              <Text style={styles.tierName}>{tier.name}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{tier.price}</Text>
                <Text style={styles.period}>{tier.period}</Text>
              </View>

              <View style={styles.featuresContainer}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={[
                      styles.featureText,
                      feature.includes('✨') && styles.featureHighlight,
                      feature.includes('📊') && styles.featurePremium
                    ]}>
                      {feature.replace('✨', '').replace('📊', '').trim()}
                    </Text>
                  </View>
                ))}
                
                {tier.notIncluded && tier.notIncluded.map((feature, index) => (
                  <View key={`not-${index}`} style={styles.featureRow}>
                    <Text style={styles.crossmark}>✗</Text>
                    <Text style={styles.featureTextDisabled}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={[
                styles.selectIndicator,
                selectedTier === key && styles.selectIndicatorActive
              ]}>
                <View style={styles.radioOuter}>
                  {selectedTier === key && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Memory Feature Highlight */}
        {selectedTier !== 'basic' && (
          <View style={styles.memoryHighlight}>
            <Text style={styles.memoryIcon}>🧠</Text>
            <Text style={styles.memoryTitle}>The Power of Memory</Text>
            <Text style={styles.memoryText}>
              {selectedTier === 'pro' 
                ? "MIRRORD remembers your story. No more repeating yourself. Build a real relationship over time."
                : "Get everything in Pro plus detailed insights into your growth journey and weekly progress reports."
              }
            </Text>
          </View>
        )}

        {/* Subscribe Button */}
        <TouchableOpacity 
          style={styles.subscribeButton}
          onPress={handleSubscribe}
        >
          <LinearGradient
            colors={['#ffd700', '#ffed4e']}
            style={styles.subscribeGradient}
          >
            <Text style={styles.subscribeText}>
              {trialEnded ? 'Subscribe Now' : 'Start Free Trial'}
            </Text>
            <Text style={styles.subscribeSubtext}>
              {!trialEnded && '7 days free, then '}
              {tiers[selectedTier].price}{tiers[selectedTier].period}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Cancel anytime. Prices in USD.
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  tiersContainer: {
    gap: 15,
    marginBottom: 30,
  },
  tierCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  tierCardSelected: {
    borderColor: '#ffd700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  tierCardHighlight: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#ffd700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffd700',
  },
  period: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 5,
  },
  featuresContainer: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  crossmark: {
    color: '#666',
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  featureTextDisabled: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
    lineHeight: 20,
    textDecorationLine: 'line-through',
  },
  featureHighlight: {
    color: '#ffd700',
    fontWeight: '600',
  },
  featurePremium: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  selectIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectIndicatorActive: {
    borderColor: '#ffd700',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffd700',
  },
  memoryHighlight: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  memoryIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  memoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffd700',
    marginBottom: 10,
  },
  memoryText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  subscribeButton: {
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  subscribeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  subscribeSubtext: {
    color: '#000',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  terms: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 20,
  },
  restoreButton: {
    padding: 10,
    alignSelf: 'center',
  },
  restoreText: {
    color: '#ffd700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});