import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, } from 'react-native';
import { useSimpleAuth } from './_layout';

const COLORS = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#D1FAE5',
  primaryMid: '#6EE7B7',
  accent: '#ECFDF5',
  textDark: '#0F172A',
  textMid: '#334155',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  borderFocus: '#10B981',
  error: '#EF4444',
  errorBg: '#FFF5F5',
  errorBorder: '#FECACA',
  inputBg: '#F8FAFC',
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function FloatingLabelInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  placeholder,
  autoCapitalize = 'none',
  rightIcon,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightIcon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.borderFocus],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.12],
  });


  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, focused && inputStyles.labelFocused]}>
        {label}
      </Text>
      <Animated.View
        style={[ inputStyles.container,
          {
            borderColor,
            shadowOpacity,
            shadowColor: COLORS.primary
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 8,
            elevation: focused ? 3 : 0,
          },
        ]} >
        <TextInput
          style={inputStyles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          autoCapitalize={autoCapitalize} />
        {rightIcon && <View style={inputStyles.rightIcon}>{rightIcon}</View>}
      </Animated.View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMid,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  labelFocused: { color: COLORS.primary },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '400',
  },
  rightIcon: { paddingRight: 16 },
});

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useSimpleAuth();
  const router = useRouter();

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    const cleanUsername = username.toLowerCase().trim();

    if (!cleanUsername || !password || !confirmPassword) {
      setErrorMessage('Please fill out all fields..!');
      triggerShake();
      return;
    }
    if (cleanUsername.length < 8) {
      setErrorMessage('Username must be at least 8 characters..!');
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match..!');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login(cleanUsername);
        router.replace('/');
      } 
      else {
        setErrorMessage(data.error || data.message || 'Registration failed..!');
        triggerShake();
      }
    } 
    catch {
      setErrorMessage('Could not connect to server..!');
      triggerShake();
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} >
          
        {/* Top decorative blob */}
        <View style={styles.blobTop} />
        <View style={styles.blobTopSmall} />

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoMark}>
            <Ionicons name="leaf" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start managing your finances today.
          </Text>
        </View>

        {/* Form Card */}
        <Animated.View
          style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]} >
          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={COLORS.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <FloatingLabelInput label="Username" value={username} onChangeText={setUsername} placeholder="Username" autoCapitalize="none" />

          <FloatingLabelInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            } />

          <FloatingLabelInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword} />

          {/* Password hint */}
          <View style={styles.hintRow}>
            <View
              style={[
                styles.hintDot,
                password.length >= 8 && styles.hintDotActive,
              ]} />
            <Text style={styles.hintText}>At least 8 characters</Text>
            <View
              style={[
                styles.hintDot,
                styles.hintDotSpaced,
                /[0-9]/.test(password) && styles.hintDotActive,
              ]} />
            <Text style={styles.hintText}>Contains a number</Text>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85} >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Create Account</Text>
                <View style={styles.buttonArrow}>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/sign-in' as any)}
            disabled={loading}
            activeOpacity={0.7} >
            <Text style={styles.signInText}>
              Already have an account?{'  '}
              <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By signing up, you agree to our{' '}
          <Text style={styles.footerLink}>Terms</Text> &{' '}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Decorative blobs
  blobTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.5,
  },
  blobTopSmall: {
    position: 'absolute',
    top: 40,
    right: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryMid,
    opacity: 0.2,
  },

  // Header
  headerSection: {
    paddingTop: 72,
    paddingBottom: 36,
    alignItems: 'flex-start',
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 22,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13.5,
    fontWeight: '500',
  },

  // Password hints
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 24,
  },
  hintDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginRight: 6,
  },
  hintDotSpaced: { marginLeft: 16 },
  hintDotActive: { backgroundColor: COLORS.primary },
  hintText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // Button
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // Sign In Link
  signInButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  signInText: {
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  signInLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Footer
  footerText: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: 12.5,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
});