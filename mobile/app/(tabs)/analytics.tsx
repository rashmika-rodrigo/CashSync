import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Animated, } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
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

const CHART_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
];

const CATEGORY_ICONS: Record<string, string> = {
  Food:      'restaurant-outline',
  Shopping:  'bag-outline',
  Transport: 'car-outline',
  Bills:     'receipt-outline',
  Income:    'wallet-outline',
  Tech:      'hardware-chip-outline',
  Other:     'ellipsis-horizontal-outline',
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function LegendRow({
  item,
  index,
  total,
}: {
  item: any;
  index: number;
  total: number;
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
  const icon = CATEGORY_ICONS[item.text] || 'pricetag-outline';

  return (
    <Animated.View
      style={[styles.legendRow, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]} >
      {/* Icon + label */}
      <View style={[styles.legendIconWrap, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={icon as any} size={14} color={item.color} />
      </View>
      <View style={styles.legendMiddle}>
        <View style={styles.legendLabelRow}>
          <Text style={styles.legendText}>{item.text}</Text>
          <Text style={[styles.legendPct, { color: item.color }]}>{pct}%</Text>
        </View>
        {/* Progress bar */}
        <View style={styles.legendBarBg}>
          <Animated.View
            style={[
              styles.legendBarFill,
              { width: `${pct}%`, backgroundColor: item.color },
            ]}
          />
        </View>
      </View>
      <Text style={styles.legendValue}>Rs {item.value.toFixed(2)}</Text>
    </Animated.View>
  );
}

export default function Analytics() {
  const { user } = useSimpleAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [topCategory, setTopCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const cardFade  = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/transactions/${user}`);
      const transactions = await response.json();

      const expenses = transactions.filter((t: any) => Number(t.amount) < 0);
      const categoryTotals: Record<string, number> = {};

      expenses.forEach((t: any) => {
        const cat = t.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(Number(t.amount));
      });

      const formatted = Object.keys(categoryTotals)
        .map((key, i) => ({
          value: categoryTotals[key],
          color: CHART_COLORS[i % CHART_COLORS.length],
          text: key,
        }))
        .sort((a, b) => b.value - a.value);

      const total = formatted.reduce((s, i) => s + i.value, 0);
      setChartData(formatted);
      setTotalExpenses(total);
      setTopCategory(formatted[0]?.text || '');
    } 
    catch {
      console.error('Failed to load analytics');
    } 
    finally {
      setLoading(false);
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 6 }),
        Animated.timing(cardFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <View style={styles.container}>
      {/* Blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobTopSmall} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Where is your money going?</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="pie-chart-outline" size={14} color={COLORS.primary} />
            <Text style={styles.headerBadgeText}>Expenses</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your data...</Text>
          </View>
        ) : chartData.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="pie-chart-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No expense data yet</Text>
            <Text style={styles.emptySubtitle}>
              Add some expenses and we'll visualize your spending patterns here.
            </Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: cardFade, transform: [{ scale: cardScale }] }}>

            {/* ── Summary chips ── */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryIconWrap, { backgroundColor: COLORS.accent }]}>
                  <Ionicons name="layers-outline" size={14} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Categories</Text>
                  <Text style={styles.summaryValue}>{chartData.length}</Text>
                </View>
              </View>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="arrow-up-outline" size={14} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Total Spent</Text>
                  <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                    Rs {totalExpenses.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryChip}>
                <View style={[styles.summaryIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="trophy-outline" size={14} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Top Category</Text>
                  <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>{topCategory}</Text>
                </View>
              </View>
            </View>

            {/* ── Chart Card ── */}
            <View style={styles.chartCard}>
              {/* Decorative inner blobs */}
              <View style={styles.chartCardBlobTR} />
              <View style={styles.chartCardBlobBL} />

              <Text style={styles.chartCardTitle}>Expense Breakdown</Text>

              <View style={styles.chartWrap}>
                <PieChart
                  donut
                  innerRadius={78}
                  radius={110}
                  data={chartData}
                  strokeWidth={3}
                  strokeColor={COLORS.surface}
                  centerLabelComponent={() => (
                    <View style={styles.chartCenter}>
                      <Ionicons name="wallet-outline" size={20} color={COLORS.textLight} style={{ marginBottom: 4 }} />
                      <Text style={styles.chartCenterLabel}>Total</Text>
                      <Text style={styles.chartCenterAmount}>
                        Rs {totalExpenses >= 1000
                          ? `${(totalExpenses / 1000).toFixed(1)}k`
                          : totalExpenses.toFixed(0)}
                      </Text>
                    </View>
                  )}
                />
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Legend */}
              <View style={styles.legendContainer}>
                {chartData.map((item, i) => (
                  <LegendRow key={i} item={item} index={i} total={totalExpenses} />
                ))}
              </View>
            </View>

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
    alignItems: 'flex-start', marginBottom: 22,
  },
  title: { fontSize: 30, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.8, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textLight, fontWeight: '400' },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.accent, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.primaryLight,
  },
  headerBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },

  // Loading
  loadingBox: { alignItems: 'center', paddingTop: 80, gap: 14 },
  loadingText: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: COLORS.accent, borderWidth: 1,
    borderColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  // Summary row
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 12, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  summaryIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  summaryLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '500', marginBottom: 2 },
  summaryValue: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.2 },

  // Chart card
  chartCard: {
    backgroundColor: COLORS.surface, borderRadius: 24,
    padding: 24, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, shadowRadius: 24, elevation: 4,
    overflow: 'hidden',
  },
  chartCardBlobTR: {
    position: 'absolute', top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primaryLight, opacity: 0.3,
  },
  chartCardBlobBL: {
    position: 'absolute', bottom: -40, left: -40,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: COLORS.accent, opacity: 0.7,
  },
  chartCardTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.textDark,
    letterSpacing: -0.3, marginBottom: 20,
  },
  chartWrap: { alignItems: 'center' },

  // Chart center
  chartCenter: { alignItems: 'center', justifyContent: 'center' },
  chartCenterLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  chartCenterAmount: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.5 },

  // Divider
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 22 },

  // Legend
  legendContainer: { gap: 14 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  legendMiddle: { flex: 1, gap: 5 },
  legendLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendText: { fontSize: 14, fontWeight: '600', color: COLORS.textMid },
  legendPct: { fontSize: 12, fontWeight: '700' },
  legendBarBg: {
    height: 5, backgroundColor: COLORS.border,
    borderRadius: 10, overflow: 'hidden',
  },
  legendBarFill: { height: '100%', borderRadius: 10 },
  legendValue: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, minWidth: 90, textAlign: 'right' },
});