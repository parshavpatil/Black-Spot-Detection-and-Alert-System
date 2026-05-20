import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NearbyBlackspot } from '@/hooks/useProximityDetection';

interface BlackspotInfoCardProps {
  closestBlackspot: NearbyBlackspot | null;
  isNearBlackspot: boolean;
}

export default function BlackspotInfoCard({ 
  closestBlackspot, 
  isNearBlackspot 
}: BlackspotInfoCardProps) {
  // Don't show card if no blackspot is nearby
  if (!isNearBlackspot || !closestBlackspot) {
    return null;
  }

  const getStatusText = () => {
    if (closestBlackspot.distance <= 100) {
      return 'Congested';
    } else if (closestBlackspot.distance <= 250) {
      return 'Approaching';
    } else {
      return 'Ready';
    }
  };

  const getStatusColor = () => {
    if (closestBlackspot.distance <= 100) {
      return '#FF0000'; // Red for congested
    } else if (closestBlackspot.distance <= 250) {
      return '#FFA500'; // Orange for approaching
    } else {
      return '#4CAF50'; // Green for ready
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <IconSymbol 
            name="location.circle.fill" 
            size={20} 
            color={getStatusColor()} 
          />
          <ThemedText style={styles.title} numberOfLines={1}>
            {closestBlackspot.blackspot.title}
          </ThemedText>
        </View>
        
        <View style={styles.details}>
          <ThemedText style={styles.distance}>
            {Math.round(closestBlackspot.distance)}m
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <ThemedText style={styles.statusText}>
              {getStatusText()}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    maxHeight: 100, // Limit height for smaller screens
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 6,
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
