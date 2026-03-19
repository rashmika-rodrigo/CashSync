import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  expense: '#EF4444',
  expenseBg: '#FFF5F5',
  incomeBg: '#ECFDF5',
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function TransactionItem({
  item,
  onDelete,
}: {
  item: any;
  onDelete: (id: number) => void;
}) {
  const isIncome = Number(item.amount) > 0;
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.transactionCard, { opacity: fadeAnim }]}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isIncome ? COLORS.incomeBg : COLORS.expenseBg },
          ]}
        >
          <Ionicons
            name={isIncome ? 'arrow-down' : 'arrow-up'}
            size={18}
            color={isIncome ? COLORS.primary : COLORS.expense}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.categoryPill}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: isIncome ? COLORS.primary : COLORS.expense },
          ]}
        >
          {isIncome ? '+' : '-'}Rs. {Math.abs(Number(item.amount)).toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={17} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useSimpleAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [txRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/transactions/${user}`),
        fetch(`${API_URL}/transactions/summary/${user}`),
      ]);
      setTransactions(await txRes.json());
      setSummary(await sumRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Transaction', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/transactions/${id}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              loadData();
            } else {
              Alert.alert('Error', 'Failed to delete transaction.');
            }
          } catch {
            Alert.alert('Error', 'Could not connect to server.');
          }
        },
      },
    ]);
  };

  const balance = Number(summary?.balance || 0);
  const income = Number(summary?.income || 0);
  const expenses = Math.abs(Number(summary?.expenses || 0));

  // Initials avatar
  const initials = user ? user.slice(0, 2).toUpperCase() : '??';

  return (
    <View style={styles.container}>
      {/* Subtle top blob */}
      <View style={styles.blobTop} />
      <View style={styles.blobTopSmall} />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={handleDelete} />
        )}
        ListHeaderComponent={
          <>
            {/* ── Header ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good day,</Text>
                <Text style={styles.username}>{user}</Text>
              </View>
              <TouchableOpacity style={styles.avatarButton} onPress={handleSignOut}>
                <Text style={styles.avatarText}>{initials}</Text>
                <View style={styles.logoutBadge}>
                  <Ionicons name="log-out-outline" size={10} color={COLORS.primaryDark} />
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Balance Card ── */}
            <View style={styles.balanceCard}>
              {/* Internal blobs for card depth */}
              <View style={styles.cardBlobLeft} />
              <View style={styles.cardBlobRight} />

              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceTotal}>
                Rs. {balance.toFixed(2)}
              </Text>

              <View style={styles.balanceDivider} />

              <View style={styles.balanceRow}>
                {/* Income */}
                <View style={styles.statBox}>
                  <View style={styles.statIconWrap}>
                    <Ionicons name="arrow-down" size={14} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={styles.statAmount}>+Rs. {income.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Vertical separator */}
                <View style={styles.verticalSep} />

                {/* Expenses */}
                <View style={styles.statBox}>
                  <View style={[styles.statIconWrap, styles.statIconExpense]}>
                    <Ionicons name="arrow-up" size={14} color="#F87171" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Expenses</Text>
                    <Text style={[styles.statAmount, { color: 'rgba(255,255,255,0.75)' }]}>
                      -Rs. {expenses.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Section Header ── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{transactions.length}</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add your first one.</Text>
          </View>
        }
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Blobs
  blobTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.45,
    zIndex: 0,
  },
  blobTopSmall: {
    position: 'absolute',
    top: 30,
    right: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primaryMid,
    opacity: 0.18,
    zIndex: 0,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 110,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textTransform: 'capitalize',
    letterSpacing: -0.4,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  logoutBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Balance Card
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 26,
    marginBottom: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBlobLeft: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardBlobRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceTotal: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: -1,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 18,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconExpense: {
    backgroundColor: 'rgba(248,113,113,0.2)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  verticalSep: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  sectionBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  // Transaction Cards
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transactionCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '400',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 22,
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
});
