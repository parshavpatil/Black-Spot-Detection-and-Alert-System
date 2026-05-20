import React from 'react';
import { StyleSheet, View } from 'react-native';

import MapViewComponent from '@/components/MapView';
import { ThemedText } from '@/components/themed-text';
import { useApp } from '@/context/AppContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabTwoScreen() {
  const { userLocation, isTracking } = useApp();

  return (
    <View style={styles.container}>
      {/* Map Component - full screen */}
      <MapViewComponent />

      {/* Minimized Location Info Card - above navbar */}
      {userLocation && isTracking && (
        <View style={styles.minimizedCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <IconSymbol name="speedometer" size={14} color="#FFFFFF" />
              <ThemedText style={styles.infoLabel}>Speed</ThemedText>
              <ThemedText style={styles.infoValue}>
                {userLocation.coords.speed ? `${(userLocation.coords.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <IconSymbol name="location.fill" size={14} color="#FFFFFF" />
              <ThemedText style={styles.infoLabel}>Latitude</ThemedText>
              <ThemedText style={styles.infoValue}>
                {userLocation.coords.latitude.toFixed(5)}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <IconSymbol name="location.fill" size={14} color="#FFFFFF" />
              <ThemedText style={styles.infoLabel}>Longitude</ThemedText>
              <ThemedText style={styles.infoValue}>
                {userLocation.coords.longitude.toFixed(5)}
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  minimizedCard: {
    position: 'absolute',
    bottom: 92, // above floating navbar
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 1,
  },
});