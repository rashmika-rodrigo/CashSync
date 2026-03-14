import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSimpleAuth } from "./_layout";

const COLORS = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  primary: "#10B981",
  textDark: "#111827",
  textLight: "#6B7280",
  expense: "#EF4444",
  border: "#E5E7EB",
};
const CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Income",
  "Tech",
  "Other",
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

  const isExpense = type === "Expense";

  const handleSave = async () => {
    if (!title || !amount) {
      Alert.alert("Missing Info", "Please enter a title and amount!");
      return;
    }
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
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
      } else {
        Alert.alert("Error", "Failed to save transaction.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isExpense && styles.toggleActiveExpense,
            ]}
            onPress={() => setType("Expense")}
          >
            <Text
              style={[styles.toggleText, isExpense && styles.toggleTextActive]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !isExpense && styles.toggleActiveIncome,
            ]}
            onPress={() => setType("Income")}
          >
            <Text
              style={[styles.toggleText, !isExpense && styles.toggleTextActive]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={[
              styles.amountInput,
              { color: isExpense ? COLORS.expense : COLORS.primary },
            ]}
            placeholder="0.00"
            placeholderTextColor="#D1D5DB"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.inputLabel}>Transaction Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Coffee shop, Salary"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  category === cat && styles.categoryPillActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleActiveExpense: {
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleActiveIncome: {
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: { fontSize: 15, fontWeight: "600", color: COLORS.textLight },
  toggleTextActive: { color: COLORS.textDark },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginRight: 8,
    marginTop: 5,
  },
  amountInput: { fontSize: 56, fontWeight: "bold", minWidth: 150 },
  detailsContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 100,
    minHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 10,
    marginTop: 15,
  },
  textInput: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: { color: COLORS.textLight, fontSize: 14, fontWeight: "500" },
  categoryTextActive: { color: COLORS.surface },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: COLORS.surface, fontSize: 18, fontWeight: "bold" },
});
