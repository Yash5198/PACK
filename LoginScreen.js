// screens/LoginScreen.js - Premium Professional Edition
import React, { useState, useRef, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Premium Color Palette - Matching LandingScreen
const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  secondary: '#7C3AED',
  accent: '#06B6D4',
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
  error: '#EF4444',
};

export default function LoginScreen({ navigation, onLogin }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Premium animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Premium entrance sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
  
    try {
      if (isLogin) {
        // Login
        const user = await AuthService.login(email, password);
        Alert.alert(
          'Welcome Back!',
          `Hello ${user.name}! Ready to hit the track?`,
          [
            {
              text: 'Let\'s Run',
              onPress: () => {
                if (onLogin) onLogin();
                navigation.navigate('MainApp');
              }
            }
          ]
        );
      } else {
        // Register
        const user = await AuthService.register(name, email, password);
        Alert.alert(
          'Account Created!',
          `Welcome to Pack, ${user.name}! Your running journey begins now.`,
          [
            {
              text: 'Start Running',
              onPress: () => {
                if (onLogin) onLogin();
                navigation.navigate('MainApp');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Authentication Error',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const socialLogins = [
    { icon: 'google', color: '#DB4437', label: 'Continue with Google' },
    { icon: 'apple', color: '#000000', label: 'Continue with Apple' },
    { icon: 'facebook', color: '#4267B2', label: 'Continue with Facebook' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons 
                    name="run-fast" 
                    size={24} 
                    color="white" 
                  />
                </LinearGradient>
                <Text style={styles.appName}>PACK</Text>
              </View>
              
              <View style={styles.placeholder} />
            </View>
          </Animated.View>

          {/* Premium Hero Section */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceElevated]}
              style={styles.heroBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                  {isLogin ? 'Welcome Back' : 'Join Pack'}
                </Text>
                
                <Text style={styles.heroDescription}>
                  {isLogin 
                    ? 'Sign in to continue your running journey with professional tracking'
                    : 'Create an account to access professional group run management'
                  }
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Premium Form Section */}
          <Animated.View 
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: formAnim }]
              }
            ]}
          >
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                onPress={() => setIsLogin(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                onPress={() => setIsLogin(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>
                </View>
              )}

              {isLogin && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryLight]}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <Feather name="loader" size={20} color="white" style={styles.loadingIcon} />
                  ) : (
                    <Feather name={isLogin ? "log-in" : "user-plus"} size={20} color="white" />
                  )}
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Social Login Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              {socialLogins.map((social, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Coming Soon', `${social.label} integration coming soon!`)}
                >
                  <LinearGradient
                    colors={[COLORS.surfaceHigh, COLORS.surfaceElevated]}
                    style={styles.socialButtonBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {social.icon === 'google' && <Feather name={social.icon} size={20} color={social.color} />}
                    {social.icon === 'apple' && <Feather name={social.icon} size={20} color={social.color} />}
                    {social.icon === 'facebook' && <Feather name={social.icon} size={20} color={social.color} />}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Terms & Privacy */}
            {!isLogin && (
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Switch Mode Prompt */}
          <View style={styles.switchModeContainer}>
            <Text style={styles.switchModeText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchModeLink}>
                {isLogin ? ' Sign Up' : ' Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  heroDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    fontWeight: '400',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  toggleTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  loadingIcon: {
    animation: 'spin 1s linear infinite',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  socialButtonBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  termsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  switchModeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  switchModeLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
});