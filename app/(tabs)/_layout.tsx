import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
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
        // Ensure tab bar respects bottom safe area for devices with home indicators
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 49 + insets.bottom, // Default tab bar height (49) + safe area
        },
      }}
    >
      {/* Tab 1: Calculator */}
      <Tabs.Screen
        name="index"
        options={{
          title: "الحاسبة",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calculator" color={color} />,
        }}
      />

      {/* Tab 2: Comparison */}
      <Tabs.Screen
        name="compare"
        options={{
          title: "المقارنة",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />

      {/* Tab 3: Tests */}
      <Tabs.Screen
        name="tests"
        options={{
          title: "الاختبارات",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle.fill" color={color} />,
        }}
      />

      {/* Tab 4: Rules */}
      <Tabs.Screen
        name="rules"
        options={{
          title: "القواعد",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />

      {/* Tab 5: Audit Log */}
      <Tabs.Screen
        name="audit"
        options={{
          title: "السجل",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
    </Tabs>
  );
}
