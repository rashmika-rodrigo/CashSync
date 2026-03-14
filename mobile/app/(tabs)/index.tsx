import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSimpleAuth } from '../../app/_layout';

const COLORS = { background: '#F8F9FA', surface: '#FFFFFF', primary: '#10B981', textDark: '#111827', textLight: '#6B7280', expense: '#EF4444', border: '#E5E7EB' };
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useSimpleAuth();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [refreshing, setRefreshing] = useState(false);

  // FETCH DATA
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [txRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/transactions/${user}`),
        fetch(`${API_URL}/transactions/summary/${user}`)
      ]);
      setTransactions(await txRes.json());
      setSummary(await sumRes.json());
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => { loadData(); }, [loadData]);

  // LOGOUT HANDLER
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to exit your wallet?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() }
    ]);
  };

  // DELETE HANDLER 
  const handleDelete = (id: number) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/transactions/${id}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              loadData(); // Refresh the list instantly!
            } else {
              Alert.alert("Error", "Failed to delete transaction.");
            }
          } catch (error) {
            Alert.alert("Error", "Could not connect to server.");
          }
        } 
      }
    ]);
  };

  const TransactionItem = ({ item }: { item: any }) => {
    const isIncome = Number(item.amount) > 0;
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#D1FAE5' : '#FEE2E2' }]}>
            <Ionicons name={isIncome ? 'arrow-down' : 'arrow-up'} size={20} color={isIncome ? COLORS.primary : COLORS.expense} />
          </View>
          <View>
            <Text style={styles.transactionTitle}>{item.title}</Text>
            <Text style={styles.transactionCategory}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: isIncome ? COLORS.primary : COLORS.textDark }]}>
            {isIncome ? '+' : ''}${Math.abs(Number(item.amount)).toFixed(2)}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user}</Text>
        </View>
        <TouchableOpacity style={styles.profilePic} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceTotal}>${Number(summary?.balance || 0).toFixed(2)}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.incomeExpenseBox}>
            <Ionicons name="arrow-down-circle" size={20} color="#FFF" />
            <View><Text style={styles.boxLabel}>Income</Text><Text style={styles.boxAmount}>+${Number(summary?.income || 0).toFixed(2)}</Text></View>
          </View>
          <View style={styles.incomeExpenseBox}>
            <Ionicons name="arrow-up-circle" size={20} color="#FFF" />
            <View><Text style={styles.boxLabel}>Expenses</Text><Text style={styles.boxAmount}>-${Math.abs(Number(summary?.expenses || 0)).toFixed(2)}</Text></View>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}><Text style={styles.listTitle}>Recent Transactions</Text></View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => <TransactionItem item={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet. Add one!</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create' as any)}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 14, color: COLORS.textLight },
  username: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark, textTransform: 'capitalize' },
  profilePic: { width: 45, height: 45, backgroundColor: '#D1FAE5', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  balanceCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 25, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: 30 },
  balanceLabel: { color: '#D1FAE5', fontSize: 14, fontWeight: '500' },
  balanceTotal: { color: COLORS.surface, fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 15 },
  incomeExpenseBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  boxLabel: { color: '#D1FAE5', fontSize: 12 },
  boxAmount: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  transactionRight: { flexDirection: 'row', alignItems: 'center', gap: 10 }, // NEW: aligns amount and trash icon
  deleteButton: { padding: 4 }, // NEW: gives the trash icon a little touch padding
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transactionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  transactionCategory: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 20, fontStyle: 'italic' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, backgroundColor: COLORS.primary, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }
});