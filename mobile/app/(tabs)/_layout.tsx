import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSimpleAuth } from "../_layout";

export default function TabLayout() {
  const { user } = useSimpleAuth();

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: "#10B981",
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', height: 60, paddingBottom: 10 }
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics", tabBarIcon: ({ color }) => <Ionicons name="pie-chart" size={24} color={color} /> }} />
      <Tabs.Screen name="ai-advisor" options={{ title: "AI Advisor", tabBarIcon: ({ color }) => <Ionicons name="sparkles" size={24} color={color} /> }} />
    </Tabs>
  );
}