import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Alert, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { Blackspot } from '@/data/blackspots';
import { useProximityDetection } from '@/hooks/useProximityDetection';
import BlackspotInfoCard from './BlackspotInfoCard';
import { useApp } from '@/context/AppContext';
import { fetchBlackspots } from '@/services/BlackspotService';

export default function MapViewComponent() {
  const { userLocation, isTracking } = useApp();
  const mapRef = useRef<MapView>(null);
  const [spots, setSpots] = useState<Blackspot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Removed user travel path rendering

  // Use proximity detection hook
  const proximityResult = useProximityDetection(userLocation, {
    radiusMeters: 500,
    checkIntervalMs: 3000, // Check every 3 seconds
    onProximityChange: (result) => {
      console.log('Proximity check:', {
        isNearBlackspot: result.isNearBlackspot,
        nearbyCount: result.nearbyBlackspots.length,
        closest: result.closestBlackspot?.blackspot.title
      });
    }
  }, spots);

  // Load blackspots from API
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchBlackspots();
        if (!cancelled) {
          console.log('[Mobile/MapView] loaded spots count:', data.length);
          setSpots(data);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('[Mobile/MapView] load error:', (e as Error)?.message || e);
          setError('Failed to load blackspots');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Smooth camera animation when location updates
  useEffect(() => {
    if (userLocation && mapRef.current && isTracking) {
      mapRef.current.animateCamera({
        center: {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        },
        zoom: 15,
      }, { duration: 1000 });

      // Removed appending to user path (no route trail)
    }
  }, [userLocation?.coords.latitude, userLocation?.coords.longitude, isTracking]);

  const getMarkerColor = () => {
    return '#FF0000'; // Red for all blackspots
  };

  if (!isTracking) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Start tracking to view map</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Location not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor="#2196F3"
        moveOnMarkerPress={false}
      >

        {/* Removed user trail polyline */}

        {/* 500m detection circle around each blackspot */}
        {spots.map((blackspot) => (
          <Circle
            key={`circle-${blackspot.id}`}
            center={{
              latitude: blackspot.lat,
              longitude: blackspot.lng,
            }}
            radius={500} // 500 meters detection radius
            strokeColor="rgba(255, 0, 0, 0.3)"
            fillColor="rgba(255, 0, 0, 0.1)"
            strokeWidth={2}
          />
        ))}

        {/* Blackspot markers */}
        {spots.map((blackspot) => {
          const isNearby = proximityResult.nearbyBlackspots.some(
            nb => nb.blackspot.id === blackspot.id
          );
          
          return (
            <React.Fragment key={blackspot.id}>
              <Marker
                coordinate={{
                  latitude: blackspot.lat,
                  longitude: blackspot.lng,
                }}
                title={blackspot.title}
                description={blackspot.description}
                pinColor={getMarkerColor()}
                onPress={() => {
                  const nearbyInfo = proximityResult.nearbyBlackspots.find(
                    nb => nb.blackspot.id === blackspot.id
                  );
                  const distanceText = nearbyInfo ? ` (${nearbyInfo.distance}m away)` : '';
                  
                  Alert.alert(
                    blackspot.title,
                    `${blackspot.description}\n\nDate: ${blackspot.date}${distanceText}`,
                    [{ text: 'OK' }]
                  );
                }}
              />
              
              {/* Highlight nearby blackspots with a circle */}
              {isNearby && (
                <Circle
                  center={{
                    latitude: blackspot.lat,
                    longitude: blackspot.lng,
                  }}
                  radius={50}
                  strokeColor="rgba(255, 0, 0, 0.5)"
                  fillColor="rgba(255, 0, 0, 0.2)"
                  strokeWidth={3}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Direction line to closest blackspot */}
        {/* Removed proximity line to closest blackspot */}
      </MapView>

      {/* Clean Blackspot Info Card */}
      <BlackspotInfoCard
        closestBlackspot={proximityResult.closestBlackspot}
        isNearBlackspot={proximityResult.isNearBlackspot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    padding: 20,
  },
});
