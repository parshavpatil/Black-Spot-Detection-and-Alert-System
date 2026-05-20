import React from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useApp } from '@/context/AppContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TrackingToggle() {
  const { 
    isTracking, 
    hasLocationPermission, 
    isInitialized, 
    error, 
    startTracking, 
    stopTracking, 
    requestLocationPermission,
    clearError 
  } = useApp();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleToggleTracking = async () => {
    try {
      if (isTracking) {
        // Stop tracking
        Alert.alert(
          'Stop Tracking',
          'Are you sure you want to stop blackspot tracking?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Stop', style: 'destructive', onPress: stopTracking }
          ]
        );
      } else {
        // Start tracking
        if (!hasLocationPermission) {
          const granted = await requestLocationPermission();
          if (!granted) {
            Alert.alert(
              'Permission Required',
              'Location permission is required to track blackspots. Please enable it in your device settings.',
              [{ text: 'OK' }]
            );
            return;
          }
        }
        await startTracking();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle tracking. Please try again.');
    }
  };

  if (!isInitialized) {
    return (
      <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled>
        <IconSymbol name="arrow.clockwise" size={24} color="#666" />
        <ThemedText style={styles.buttonText}>Initializing...</ThemedText>
      </TouchableOpacity>
    );
  }

  if (error) {
    return (
      <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={clearError}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FFFFFF" />
        <ThemedText style={styles.buttonText}>Error - Tap to dismiss</ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isTracking ? styles.stopButton : styles.startButton,
        { backgroundColor: isTracking ? '#EF4444' : colors.tint, shadowColor: isTracking ? '#EF4444' : colors.tint }
      ]} 
      onPress={handleToggleTracking}
    >
      <IconSymbol 
        name={isTracking ? "stop.fill" : "play.fill"} 
        size={24} 
        color="#FFFFFF" 
      />
      <ThemedText style={styles.buttonText}>
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    minWidth: 200,
  },
  startButton: {
    // backgroundColor will be set dynamically
  },
  stopButton: {
    // backgroundColor will be set dynamically
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  errorButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
