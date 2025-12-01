// screens/LandingScreen.js - Premium Professional Edition
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Premium Color Palette - Inspired by professional enterprise apps
const COLORS = {
  primary: '#2563EB',      // Professional blue
  primaryDark: '#1D4ED8',   // Darker blue for depth
  primaryLight: '#3B82F6',  // Lighter blue
  secondary: '#7C3AED',     // Professional purple
  accent: '#06B6D4',        // Cyan accent
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  surfaceHigh: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function LandingScreen({ navigation }) {
  // Premium animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const featuresAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Premium entrance sequence
    Animated.sequence([
      // Logo glow effect
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Main content fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      // Features slide in
      Animated.timing(featuresAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartRunning = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('MainApp');
  };

  const features = [
    {
      icon: 'map-marker-radius',
      title: 'Live Group Tracking',
      description: 'Real-time GPS positioning for entire running groups',
      gradient: [COLORS.primary, COLORS.primaryLight]
    },
    {
      icon: 'chart-bell-curve',
      title: 'Intelligent Gap Analytics',
      description: 'AI-powered distance analysis with predictive insights',
      gradient: [COLORS.secondary, '#8B5CF6']
    },
    {
      icon: 'database-clock',
      title: 'Performance Analytics',
      description: 'Comprehensive metrics and historical performance tracking',
      gradient: [COLORS.accent, '#22D3EE']
    },
    {
      icon: 'shield-check',
      title: 'Safety Features',
      description: 'Real-time alerts and emergency location sharing',
      gradient: [COLORS.success, '#34D399']
    }
  ];

  const stats = [
    
  ];
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Premium Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1]
                    })
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons 
                  name="run-fast" 
                  size={28} 
                  color="white" 
                  style={styles.logoIcon}
                />
              </LinearGradient>
              <View style={styles.logoTextContainer}>
                <Text style={styles.appName}>PACK</Text>
              </View>
            </Animated.View>
            
            <View style={styles.trustBadges}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.trustBadge}>
                  <Text style={styles.trustValue}>{stat.value}</Text>
                  <Text style={styles.trustLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Premium Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[COLORS.surface, COLORS.surfaceElevated]}
            style={styles.heroBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View 
              style={[
                styles.heroContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.heroTitle}>
                Professional{'\n'}Group Run Management
              </Text>
              
              <Text style={styles.heroDescription}>
                Enterprise-grade tracking platform for running clubs, teams, and professional athletes.
              </Text>
              
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Feather name="zap" size={16} color={COLORS.success} />
                  <Text style={styles.heroStatText}>Real-time Updates</Text>
                </View>
                <View style={styles.heroStat}>
                  <Feather name="shield" size={16} color={COLORS.primary} />
                  <Text style={styles.heroStatText}>Secure & Private</Text>
                </View>
                <View style={styles.heroStat}>
                  <Feather name="activity" size={16} color={COLORS.accent} />
                  <Text style={styles.heroStatText}>Advanced Analytics</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Premium Features Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Professional Features</Text>
            <Text style={styles.sectionSubtitle}>Built for serious runners and coaches</Text>
          </View>
          
          <Animated.View 
            style={[
              styles.featuresGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: featuresAnim }]
              }
            ]}
          >
            {features.map((feature, index) => (
              <LinearGradient
                key={index}
                colors={feature.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featureCard}
              >
                <View style={styles.featureIconContainer}>
                  <MaterialCommunityIcons 
                    name={feature.icon} 
                    size={24} 
                    color="white" 
                  />
                </View>
                <Text style={styles.featureCardTitle}>{feature.title}</Text>
                <Text style={styles.featureCardDescription}>{feature.description}</Text>
              </LinearGradient>
            ))}
          </Animated.View>
        </View>

        {/* Premium Workflow */}
        <View style={styles.workflowSection}>
          <LinearGradient
            colors={[COLORS.surfaceElevated, COLORS.surface]}
            style={styles.workflowBackground}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>How Professionals Use Pack</Text>
            </View>
            
            <View style={styles.workflowSteps}>
              {[
                {
                  step: '01',
                  title: 'Create Session',
                  description: 'Set up running parameters and invite participants',
                  icon: 'plus-circle'
                },
                {
                  step: '02',
                  title: 'Real-time Monitoring',
                  description: 'Track all runners with live location and gap data',
                  icon: 'eye'
                },
                {
                  step: '03',
                  title: 'Analyze Performance',
                  description: 'Review comprehensive analytics and insights',
                  icon: 'trending-up'
                }
              ].map((step, index) => (
                <View key={index} style={styles.workflowStep}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepNumber}>{step.step}</Text>
                    <Feather name={step.icon} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Premium CTA */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primary]}
            style={styles.ctaBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Ready for Professional Run Tracking?</Text>
              
              <Text style={styles.ctaDescription}>
                Join elite running clubs and professional coaches who trust Pack for their group training.
              </Text>
              
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={handleStartRunning}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['white', '#F0F9FF']}
                  style={styles.ctaButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialCommunityIcons 
                    name="run" 
                    size={20} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.ctaButtonText}>Start Running</Text>
                  <Feather 
                    name="arrow-right" 
                    size={18} 
                    color={COLORS.primary} 
                    style={styles.ctaButtonIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.ctaFeatures}>
                <View style={styles.ctaFeature}>
                  <Feather name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.ctaFeatureText}>No setup required</Text>
                </View>
                <View style={styles.ctaFeature}>
                  <Feather name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.ctaFeatureText}>Instant group creation</Text>
                </View>
                <View style={styles.ctaFeature}>
                  <Feather name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.ctaFeatureText}>Real-time tracking</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Premium Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerLogo}>PACK</Text>
            <Text style={styles.footerTagline}>Professional Run Management</Text>
            <Text style={styles.footerCopyright}>© 2024 Pack Technologies Inc.</Text>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Privacy</Text>
              <Text style={styles.footerLinkDivider}>•</Text>
              <Text style={styles.footerLink}>Terms</Text>
              <Text style={styles.footerLinkDivider}>•</Text>
              <Text style={styles.footerLink}>Security</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  logoIcon: {
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 16,
  },
  trustBadge: {
    alignItems: 'flex-end',
  },
  trustValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  trustLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
  },
  heroBackground: {
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 16,
    letterSpacing: -1,
  },
  heroDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 320,
    fontWeight: '400',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  heroStatText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    backgroundColor: COLORS.surfaceElevated,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  featureCard: {
    width: (width - 48 - 16) / 2,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    lineHeight: 24,
  },
  featureCardDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    fontWeight: '400',
  },
  workflowSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    backgroundColor: COLORS.surface,
  },
  workflowBackground: {
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
  },
  workflowSteps: {
    gap: 24,
  },
  workflowStep: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    opacity: 0.1,
    letterSpacing: -1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontWeight: '400',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  ctaBackground: {
    borderRadius: 28,
    padding: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  ctaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 320,
    fontWeight: '400',
  },
  ctaButton: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 32,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  ctaButtonIcon: {
    marginLeft: 4,
  },
  ctaFeatures: {
    gap: 12,
    alignItems: 'center',
  },
  ctaFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaFeatureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: COLORS.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  footerTagline: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontWeight: '500',
    marginBottom: 16,
  },
  footerCopyright: {
    fontSize: 12,
    color: COLORS.textTertiary,
    opacity: 0.7,
    marginBottom: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerLinkDivider: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
});