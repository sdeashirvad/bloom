import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={focused ? Colors.primary : Colors.textSoft} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 84 : 72,
          paddingBottom: Platform.OS === 'web' ? 34 : 12,
          paddingTop: 8,
          shadowColor: Colors.shadow.color,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'journal' : 'journal-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'leaf' : 'leaf-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'moon' : 'moon-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.primarySoft,
  },
});
