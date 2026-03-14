import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSimpleAuth } from "../_layout";

export default function TabLayout() {
  const { user } = useSimpleAuth();

  // Guard: If no user is in memory, kick them to the login screen
  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#10B981" }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
