import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { useSimpleAuth } from "./_layout";

const COLORS = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#D1FAE5",
  primaryMid: "#6EE7B7",
  accent: "#ECFDF5",
  textDark: "#0F172A",
  textMid: "#334155",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  expense: "#EF4444",
  expenseLight: "#FEE2E2",
  inputBg: "#F8FAFC",
};

const CATEGORIES = [
  { label: "Food", icon: "restaurant-outline" },
  { label: "Shopping", icon: "bag-outline" },
  { label: "Transport", icon: "car-outline" },
  { label: "Bills", icon: "receipt-outline" },
  { label: "Income", icon: "wallet-outline" },
  { label: "Tech", icon: "hardware-chip-outline" },
  { label: "Other", icon: "ellipsis-horizontal-outline" },
];

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateTransaction() {
  const router = useRouter();
  const { user } = useSimpleAuth();
  const [type, setType] = useState<"Expense" | "Income">("Expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food");
  const [loading, setLoading] = useState(false);
  
  const [amountFocused, setAmountFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  
  const toggleAnim = useRef(new Animated.Value(0)).current; 
  const isExpense = type === "Expense";

  const switchType = (newType: "Expense" | "Income") => {
    setType(newType);
    Animated.spring(toggleAnim, {
      toValue: newType === "Expense" ? 0 : 1,
      useNativeDriver: false,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handleSave = async () => {
    if (!title || !amount) {
      Alert.alert("Missing Info", "Please enter a title and amount..!");
      return;
    }
    if (!user) {
      Alert.alert("Error", "Please login first..!");
      return;
    }

    setLoading(true);
    try {
      const formattedAmount = isExpense
        ? -Math.abs(parseFloat(amount))
        : Math.abs(parseFloat(amount));

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user,
          title,
          amount: formattedAmount,
          category,
        }),
      });

      if (response.ok) {
        router.back();
      } 
      else {
        Alert.alert("Error", "Failed to save transaction..!");
      }
    } 
    catch {
      Alert.alert("Error", "Could not connect to server..!");
    } 
    finally {
      setLoading(false);
    }
  };

  const pillLeft = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "51%"],
  });

  const accentColor = isExpense ? COLORS.expense : COLORS.primary;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior={Platform.OS === "ios" ? "padding" : "height"} >

      <View style={[styles.blobTop, { backgroundColor: isExpense ? COLORS.expenseLight : COLORS.primaryLight }]} />
      <View style={styles.blobTopSmall} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7} >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Type Toggle */}
        <View style={styles.toggleWrapper}>
          <Animated.View
            style={[
              styles.togglePill,
              { left: pillLeft, backgroundColor: accentColor },
            ]} />
          <TouchableOpacity style={styles.toggleOption} onPress={() => switchType("Expense")} activeOpacity={0.8} >
            <Ionicons name="arrow-up-circle-outline" size={16} color={isExpense ? "#FFF" : COLORS.textLight} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, isExpense && styles.toggleTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleOption} onPress={() => switchType("Income")} activeOpacity={0.8} >
            <Ionicons name="arrow-down-circle-outline" size={16} color={!isExpense ? "#FFF" : COLORS.textLight} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, !isExpense && styles.toggleTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Standard Form Card */}
        <View style={styles.detailsCard}>
          
          {/* Amount Input */}
          <Text style={styles.inputLabel}>Amount (Rs.)</Text>
          <View
            style={[
              styles.textInputWrapper,
              amountFocused && { borderColor: accentColor },
            ]} >
            <Ionicons name="cash-outline" size={18} color={amountFocused ? accentColor : COLORS.textLight} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.textInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              placeholder="0.00"
              placeholderTextColor={COLORS.textLight}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)} 
            />
          </View>

          {/* Title Input */}
          <Text style={[styles.inputLabel, { marginTop: 20 }]}>Transaction Title</Text>
          <View
            style={[
              styles.textInputWrapper,
              titleFocused && { borderColor: accentColor },
            ]} >
            <Ionicons name="create-outline" size={18} color={titleFocused ? accentColor : COLORS.textLight} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.textInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              placeholder="Ex: Coffee, Salary..."
              placeholderTextColor={COLORS.textLight}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)} 
            />
          </View>

          {/* Category Selector */}
          <Text style={[styles.inputLabel, { marginTop: 22 }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.label;
              return (
                <TouchableOpacity
                  key={cat.label}
                  style={[
                    styles.categoryPill,
                    isActive && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => setCategory(cat.label)}
                  activeOpacity={0.75} >
                  <Ionicons name={cat.icon as any} size={14} color={isActive ? "#FFF" : COLORS.textLight} style={{ marginRight: 5 }} />
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]} >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: accentColor },
              loading && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85} >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <View style={styles.saveButtonInner}>
                <Text style={styles.saveButtonText}>Save Transaction</Text>
                <View style={styles.saveButtonArrow}>
                  <Ionicons name="checkmark" size={18} color={accentColor} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  blobTop: {
    position: "absolute", top: -50, right: -50,
    width: 160, height: 160, borderRadius: 80,
    opacity: 0.45, zIndex: 0,
  },
  blobTopSmall: {
    position: "absolute", top: 30, right: 60,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "#6EE7B7", opacity: 0.15, zIndex: 0,
  },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 20,
  },
  backButton: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textDark, letterSpacing: -0.3 },

  toggleWrapper: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 20,
    backgroundColor: "#F1F5F9", borderRadius: 16, padding: 4,
    height: 52, position: "relative", alignItems: "center",
  },
  togglePill: {
    position: "absolute", width: "48%", height: 44, borderRadius: 13,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  toggleOption: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 1, height: 44, borderRadius: 13 },
  toggleText: { fontSize: 14, fontWeight: "700", color: COLORS.textLight, letterSpacing: 0.1 },
  toggleTextActive: { color: "#FFFFFF" },

  detailsCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 24,
    padding: 24, borderWidth: 1, borderColor: "#F1F5F9",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 4,
  },
  inputLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textMid, marginBottom: 10, letterSpacing: 0.3 },
  textInputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBg,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  textInput: { flex: 1, fontSize: 16, color: COLORS.textDark, fontWeight: "400" },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryPill: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.border,
  },
  categoryText: { color: COLORS.textLight, fontSize: 13, fontWeight: "600" },
  categoryTextActive: { color: "#FFFFFF" },

  saveButton: {
    marginTop: 28, borderRadius: 16, paddingVertical: 17, paddingHorizontal: 24,
    alignItems: "center", justifyContent: "center", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 14, elevation: 6, minHeight: 58,
  },
  saveButtonDisabled: { opacity: 0.7, shadowOpacity: 0 },
  saveButtonInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  saveButtonArrow: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
  },
});