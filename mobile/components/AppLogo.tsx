import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  color?: string;
}

export default function AppLogo({
  size = 'medium',
  showText = true,
  color = '#2196F3',
}: AppLogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { icon: 24, text: 16 };
      case 'large':
        return { icon: 60, text: 28 };
      default:
        return { icon: 40, text: 20 };
    }
  };

  const { icon: iconSize, text: textSize } = getSize();

  // Animation effect
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <LinearGradient
        colors={['#2196F3', '#21CBF3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.logoContainer, { width: iconSize * 2, height: iconSize * 2 }]}
      >
        <Image
          source={require('@/assets/images/sentinel-eye.png')}
          style={{
            width: iconSize * 1.8,
            height: iconSize * 1.8,
            borderRadius: iconSize / 4,
          }}
          contentFit="contain"
        />
      </LinearGradient>

      {showText && (
        <ThemedText
          style={[
            styles.logoText,
            { fontSize: textSize, color },
          ]}
        >
          Blackspot <ThemedText style={{ fontWeight: '900', color: '#21CBF3' }}>Alert</ThemedText>
        </ThemedText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoContainer: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
