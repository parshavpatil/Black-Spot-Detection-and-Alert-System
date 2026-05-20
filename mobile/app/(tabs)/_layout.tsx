import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AppLogo from '@/components/AppLogo';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        tabBarHideOnKeyboard: true,
        animation: 'shift',
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 24 : 18,
          height: Platform.OS === 'ios' ? 92 : 76,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          position: 'absolute',
          bottom: 8,
          left: 0,
          right: 0,
          marginHorizontal: 8,
          borderRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          fontFamily: 'system-ui',
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          fontFamily: 'system-ui',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Blackspot Alert',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={focused ? 26 : 22}
                color={color}
              />
            </View>
          ),
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <AppLogo size="small" showText={true} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Blackspot Alert',
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons
                name={focused ? 'map' : 'map-outline'}
                size={focused ? 26 : 22}
                color={color}
              />
            </View>
          ),
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <AppLogo size="small" showText={true} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
});
