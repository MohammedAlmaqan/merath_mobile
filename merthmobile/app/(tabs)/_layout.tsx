import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 49 + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الحاسبة",
          tabBarIcon: ({ color }) => <MaterialIcons name="calculate" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="examples"
        options={{
          title: "أمثلة",
          tabBarIcon: ({ color }) => <MaterialIcons name="lightbulb" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="compare"
        options={{
          title: "المقارنة",
          tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="tests"
        options={{
          title: "الاختبارات",
          tabBarIcon: ({ color }) => <MaterialIcons name="check-circle" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="rules"
        options={{
          title: "القواعد",
          tabBarIcon: ({ color }) => <MaterialIcons name="library-books" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="audit"
        options={{
          title: "السجل",
          tabBarIcon: ({ color }) => <MaterialIcons name="list" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
