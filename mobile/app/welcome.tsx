import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

const COLORS = {
  background: '#FFFFFF',
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#D1FAE5',
  primaryMid: '#6EE7B7',
  accent: '#ECFDF5',
  textDark: '#0F172A',
  textMid: '#334155',
  textLight: '#94A3B8',
  surface: '#FFFFFF',
};

export default function Welcome() {
  const router = useRouter();

  // Animation refs
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const rotatePulse = useRef(new Animated.Value(0)).current;
  const ring1Anim   = useRef(new Animated.Value(0)).current;
  const ring2Anim   = useRef(new Animated.Value(0)).current;
  const floatAnim   = useRef(new Animated.Value(0)).current;
  const btnSlide    = useRef(new Animated.Value(60)).current;
  const btnFade     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon entrance
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 12, delay: 100 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Pulse rings
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Anim, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(ring1Anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring2Anim, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring2Anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }, 900);

    // Gentle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Button entrance (delayed)
    Animated.parallel([
      Animated.timing(btnFade,  { toValue: 1, duration: 500, delay: 700, useNativeDriver: true }),
      Animated.timing(btnSlide, { toValue: 0, duration: 500, delay: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const ring1Scale   = ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const ring1Opacity = ring1Anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 0.4, 0] });
  const ring2Scale   = ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const ring2Opacity = ring2Anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 0.25, 0] });

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgBlobTopRight} />
      <View style={styles.bgBlobTopRightSmall} />
      <View style={styles.bgBlobBottomLeft} />
      <View style={styles.bgGridDot} />

      {/* Center content */}
      <View style={styles.content}>
        {/* Icon with pulse rings */}
        <Animated.View style={[styles.iconWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: floatAnim }] }]}>
          {/* Pulse ring 1 */}
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]} />
          {/* Pulse ring 2 */}
          <Animated.View style={[styles.pulseRing, styles.pulseRing2, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />

          {/* Outer glow ring */}
          <View style={styles.iconOuterRing}>
            {/* Inner icon container */}
            <View style={styles.iconInner}>
              <Ionicons name="leaf" size={44} color={COLORS.primary} />
            </View>
          </View>

          {/* Orbiting badge */}
          <View style={styles.orbitBadge}>
            <Ionicons name="trending-up" size={13} color={COLORS.primaryDark} />
          </View>
        </Animated.View>

        {/* Text */}
        <Animated.View style={[styles.textBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>CashSync</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorDivider} />
            <Text style={styles.author}>by Rashmika Rodrigo</Text>
            <View style={styles.authorDivider} />
          </View>

          <Text style={styles.description}>
            Analyze Every Transaction, Manage Finance And Grow Your Wealth.
          </Text>

          {/* Feature chips */}
          <View style={styles.chipsRow}>
            {['Smart Analysis', 'Insights', 'Secure'].map((chip, i) => (
              <View key={i} style={styles.chip}>
                <Ionicons name={i === 0 ? 'analytics-outline' : i === 1 ? 'bulb-outline' : 'shield-checkmark-outline'} size={12} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: btnFade, transform: [{ translateY: btnSlide }] }]}>
       

        <TouchableOpacity style={styles.button} onPress={() => router.push('/sign-in' as any)} activeOpacity={0.85} >
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Get Started</Text>
            <View style={styles.buttonArrow}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Free to use · No credit card required
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Background blobs
  bgBlobTopRight: {
    position: 'absolute', top: -70, right: -70,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: COLORS.primaryLight, opacity: 0.55,
  },
  bgBlobTopRightSmall: {
    position: 'absolute', top: 50, right: 70,
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primaryMid, opacity: 0.2,
  },
  bgBlobBottomLeft: {
    position: 'absolute', bottom: -80, left: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: COLORS.primaryLight, opacity: 0.35,
  },
  bgGridDot: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.025,
  },

  // Main content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  // Icon
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    width: 140,
    height: 140,
  },
  pulseRing: {
    position: 'absolute',
    width: 110, height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primaryLight,
  },
  pulseRing2: {
    backgroundColor: COLORS.primaryMid,
  },
  iconOuterRing: {
    width: 110, height: 110,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconInner: {
    width: 82, height: 82,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  orbitBadge: {
    position: 'absolute',
    top: 4, right: 4,
    width: 28, height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text block
  textBlock: { alignItems: 'center' },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: -1.5,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 25,
  },
  authorDivider: {
    flex: 1, height: 1,
    backgroundColor: COLORS.primaryLight,
    maxWidth: 40,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  description: {
    textAlign: 'center',
    fontSize: 15.5,
    color: COLORS.textLight,
    lineHeight: 24,
    paddingHorizontal: 8,
    marginBottom: 22,
    fontWeight: '400',
  },

  // Feature chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 14,
  },

  // Button
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonArrow: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer note
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});