import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Easing, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleAuth } from '../../app/_layout';

const COLORS = {
  background: '#F8FAFC',
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
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Typing animation component
function TypingText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return <Text style={styles.insightText}>{displayed}</Text>;
}

// Pulse dot loader
function ThinkingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    pulse(dot1, 0);
    pulse(dot2, 160);
    pulse(dot3, 320);
  }, []);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot,
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
            },
          ]} />
      ))}
    </View>
  );
}

// Stat mini card
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function AIAdvisor() {
  const { user } = useSimpleAuth();
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState('');
  const [insightType, setInsightType] = useState<'warning' | 'success' | 'info' | 'empty'>('empty');
  const [showResult, setShowResult] = useState(false);

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const resultFade  = useRef(new Animated.Value(0)).current;
  const cardScale   = useRef(new Animated.Value(0.96)).current;
  const iconSpin    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 8 }),
    ]).start();
  }, []);

  // Shimmer animation for the button while analyzing
  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconSpin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(iconSpin, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    } 
    else {
      shimmerAnim.stopAnimation();
      iconSpin.stopAnimation();
    }
  }, [isAnalyzing]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/transactions/summary/${user}`);
      setSummary(await response.json());
    } 
    catch (error) {
      console.error('Error loading summary for AI..!');
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const generateAIInsight = () => {
    setIsAnalyzing(true);
    setInsight('');
    setShowResult(true);
    resultFade.setValue(0);

    setTimeout(() => {
      const savingsRate = summary.income > 0
        ? ((summary.balance / summary.income) * 100).toFixed(0)
        : 0;

      let advice = '';
      let type: typeof insightType = 'info';

      if (summary.balance < 0) {
        type = 'warning';
        advice = `Your expenses have exceeded your income this period. Focus on reducing non-essential spending in Shopping or Other categories this week to return to a positive balance. Small cuts compound quickly — even Rs 500/day adds up to Rs 15,000 saved this month.`;
      } 
      else if (Number(savingsRate) > 20) {
        type = 'success';
        advice = `Outstanding work, ${user}! You're saving roughly ${savingsRate}% of your income — well above the recommended 20%. Consider moving the surplus of Rs ${Number(summary.balance).toFixed(2)} into an interest-bearing account or a low-risk investment to accelerate your wealth building.`;
      } 
      else if (summary.income > 0) {
        type = 'info';
        advice = `You're on track, but margins are tight. You've spent Rs ${Math.abs(Number(summary.expenses)).toFixed(2)} so far against an income of Rs ${Number(summary.income).toFixed(2)}. Try the 50/30/20 rule — 50% needs, 30% wants, 20% savings — to push your current ${savingsRate}% savings rate higher.`;
      } 
      else {
        type = 'empty';
        advice = `Add some income and expense transactions, and I'll start analyzing your financial health to give you personalized, data-driven wealth-building strategies tailored just for you.`;
      }

      setInsightType(type);
      setInsight(advice);
      setIsAnalyzing(false);

      Animated.spring(resultFade, { toValue: 1, useNativeDriver: true, speed: 5, bounciness: 6 }).start();
    }, 2200);
  };

  const iconRotate = iconSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const insightConfig = {
    warning: { icon: 'warning-outline',        color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: 'Heads Up' },
    success: { icon: 'trending-up-outline',     color: COLORS.primary, bg: COLORS.accent, border: COLORS.primaryLight, label: 'Great Progress' },
    info:    { icon: 'bar-chart-outline',        color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', label: 'Financial Insight' },
    empty:   { icon: 'information-circle-outline', color: COLORS.textLight, bg: COLORS.background, border: COLORS.border, label: 'Getting Started' },
  };

  const cfg = insightConfig[insightType];

  const balance  = Number(summary.balance  || 0);
  const income   = Number(summary.income   || 0);
  const expenses = Math.abs(Number(summary.expenses || 0));

  return (
    <View style={styles.container}>
      {/* Background blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobTopSmall} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>AI Advisor</Text>
            <Text style={styles.subtitle}>Powered by CashSync Intelligence</Text>
          </View>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color={COLORS.primary} />
            <Text style={styles.aiBadgeText}>Live</Text>
          </View>
        </View>

        {/* ── Summary Stats ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="arrow-down-circle-outline"
            label="Income"
            value={`Rs ${income.toFixed(0)}`}
            color={COLORS.primary} />
          <StatCard
            icon="arrow-up-circle-outline"
            label="Spent"
            value={`Rs ${expenses.toFixed(0)}`}
            color="#EF4444" />
          <StatCard
            icon="wallet-outline"
            label="Balance"
            value={`Rs ${balance.toFixed(0)}`}
            color={balance >= 0 ? COLORS.primaryDark : '#EF4444'}
          />
        </View>

        {/* ── AI Card ── */}
        <Animated.View style={[styles.aiCard, { transform: [{ scale: cardScale }] }]}>
          {/* Inner decorative blobs */}
          <View style={styles.cardBlobTR} />
          <View style={styles.cardBlobBL} />

          {/* Icon */}
          <View style={styles.iconRing}>
            <View style={styles.iconInner}>
              <Ionicons name="sparkles" size={28} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.aiGreeting}>Hello, {user}! 👋</Text>
          <Text style={styles.aiDescription}>
            I'll analyze your spending patterns and deliver instant, actionable insights to help you reach your financial goals faster.
          </Text>

          {/* Capabilities list */}
          <View style={styles.capsList}>
            {[
              { icon: 'analytics-outline',       text: 'Spending pattern analysis' },
              { icon: 'shield-checkmark-outline', text: 'Budget health check' },
              { icon: 'bulb-outline',             text: 'Personalized advice' },
            ].map((cap, i) => (
              <View key={i} style={styles.capsItem}>
                <View style={styles.capsIconWrap}>
                  <Ionicons name={cap.icon as any} size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.capsText}>{cap.text}</Text>
              </View>
            ))}
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonAnalyzing]}
            onPress={generateAIInsight}
            disabled={isAnalyzing}
            activeOpacity={0.85} >
            {isAnalyzing ? (
              <View style={styles.analyzingInner}>
                <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                  <Ionicons name="refresh" size={18} color="#FFF" />
                </Animated.View>
                <Text style={styles.analyzeButtonText}>Analyzing your data...</Text>
              </View>
            ) : (
              <View style={styles.analyzeButtonInner}>
                <Text style={styles.analyzeButtonText}>Generate Deep Insight</Text>
                <View style={styles.analyzeArrow}>
                  <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Result Card ── */}
        {showResult && (
          <Animated.View style={[styles.resultCard, { opacity: resultFade, borderColor: isAnalyzing ? COLORS.border : cfg.border, backgroundColor: isAnalyzing ? COLORS.surface : cfg.bg }]}>
            {isAnalyzing ? (
              <View style={styles.thinkingBox}>
                <View style={styles.thinkingIconWrap}>
                  <Ionicons name="sparkles" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.thinkingTitle}>Crunching your numbers</Text>
                  <Text style={styles.thinkingSubtitle}>Running financial analysis...</Text>
                </View>
                <ThinkingDots />
              </View>
            ) : (
              <View>
                {/* Result header */}
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIconWrap, { backgroundColor: cfg.color + '18' }]}>
                    <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                  </View>
                  <Text style={[styles.resultLabel, { color: cfg.color }]}>{cfg.label}</Text>
                  <View style={[styles.resultDot, { backgroundColor: cfg.color }]} />
                </View>

                {/* Typing text */}
                <TypingText text={insight} />

                {/* Footer tag */}
                <View style={styles.resultFooter}>
                  <Ionicons name="sparkles-outline" size={11} color={COLORS.textLight} />
                  <Text style={styles.resultFooterText}>Generated by CashSync AI</Text>
                </View>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  blobTop: {
    position: 'absolute', top: -50, right: -50,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: COLORS.primaryLight, opacity: 0.45,
  },
  blobTopSmall: {
    position: 'absolute', top: 30, right: 60,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: COLORS.primaryMid, opacity: 0.18,
  },

  scrollContent: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 30, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.8, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textLight, fontWeight: '400' },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.accent, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.primaryLight,
  },
  aiBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '500', marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: '700', letterSpacing: -0.3 },

  // AI Card
  aiCard: {
    backgroundColor: COLORS.surface, borderRadius: 24,
    padding: 26, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, shadowRadius: 24, elevation: 4,
    overflow: 'hidden', marginBottom: 16,
  },
  cardBlobTR: {
    position: 'absolute', top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primaryLight, opacity: 0.35,
  },
  cardBlobBL: {
    position: 'absolute', bottom: -40, left: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.accent, opacity: 0.6,
  },

  // Icon
  iconRing: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: COLORS.accent, borderWidth: 1.5,
    borderColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginBottom: 18,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  iconInner: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },

  aiGreeting: { fontSize: 22, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.4, marginBottom: 8 },
  aiDescription: { fontSize: 15, color: COLORS.textLight, lineHeight: 22, marginBottom: 22, fontWeight: '400' },

  // Capabilities
  capsList: { gap: 10, marginBottom: 26 },
  capsItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  capsIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: COLORS.accent, borderWidth: 1,
    borderColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  capsText: { fontSize: 14, color: COLORS.textMid, fontWeight: '500' },

  // Analyze button
  analyzeButton: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 17, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 14, elevation: 6, minHeight: 56,
  },
  analyzeButtonAnalyzing: { opacity: 0.85, shadowOpacity: 0.1 },
  analyzeButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  analyzingInner:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  analyzeArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Result card
  resultCard: {
    borderRadius: 22, padding: 22,
    borderWidth: 1.5,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 14, elevation: 3,
  },

  // Thinking state
  thinkingBox: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thinkingIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.accent, borderWidth: 1,
    borderColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  thinkingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  thinkingSubtitle: { fontSize: 12, color: COLORS.textLight, fontWeight: '400' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },

  // Result content
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  resultIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  resultLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3, flex: 1 },
  resultDot: { width: 7, height: 7, borderRadius: 4 },
  insightText: { fontSize: 15.5, color: COLORS.textMid, lineHeight: 26, fontWeight: '400' },
  resultFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 18, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  resultFooterText: { fontSize: 11.5, color: COLORS.textLight, fontWeight: '500' },
});