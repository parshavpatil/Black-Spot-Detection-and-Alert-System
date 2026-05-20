import { StyleSheet, View, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TrackingToggle from '@/components/TrackingToggle';
import { useApp } from '@/context/AppContext';
import AppLogo from '@/components/AppLogo';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { isTracking, userLocation } = useApp();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <AppLogo size="large" showText={true} color={colors.tint} />
        <ThemedText style={[styles.subtitle, { color: colors.text }]}>
          Stay Safe on the Road
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.icon }]}>
          Advanced blackspot detection with real-time alerts
        </ThemedText>
      </View>

      {/* Tracking Toggle Button */}
      <View style={styles.buttonContainer}>
        <TrackingToggle />
      </View>

      {/* Status Info */}
      {userLocation && (
        <View style={[styles.statusContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <ThemedText style={[styles.statusText, { color: colors.icon }]}>
            Location: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
          </ThemedText>
          <ThemedText style={[styles.statusSubtext, { color: colors.icon }]}>
            {isTracking ? 'Tracking Active' : 'Tracking Stopped'}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100, // Account for tab bar
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'system-ui',
  },
  description: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
    fontFamily: 'system-ui',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'system-ui',
  },
});
