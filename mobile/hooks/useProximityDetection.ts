import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { findNearbyBlackspots, formatDistance, haversineDistanceMeters } from '@/utils/distance';
import { blackspots as defaultBlackspots, Blackspot } from '@/data/blackspots';
import { alertService } from '@/services/AlertService';

export interface NearbyBlackspot {
  blackspot: Blackspot;
  distance: number;
}

export interface ProximityDetectionResult {
  nearbyBlackspots: NearbyBlackspot[];
  isNearBlackspot: boolean;
  closestBlackspot: NearbyBlackspot | null;
  lastChecked: Date | null;
}

export interface UseProximityDetectionOptions {
  radiusMeters?: number;
  checkIntervalMs?: number;
  onProximityChange?: (result: ProximityDetectionResult) => void;
}

export function useProximityDetection(
  userLocation: Location.LocationObject | null,
  options: UseProximityDetectionOptions = {},
  sourceBlackspots: Blackspot[] = defaultBlackspots
) {
  const {
    radiusMeters = 500,
    checkIntervalMs = 5000, // Check every 5 seconds
    onProximityChange
  } = options;

  // Initialize alert service
  useEffect(() => {
    alertService.initialize();
    return () => {
      alertService.cleanup();
    };
  }, []);

  const [result, setResult] = useState<ProximityDetectionResult>({
    nearbyBlackspots: [],
    isNearBlackspot: false,
    closestBlackspot: null,
    lastChecked: null
  });

  const checkProximity = useCallback(() => {
    if (!userLocation) {
      setResult(prevResult => {
        const newResult = {
          nearbyBlackspots: [],
          isNearBlackspot: false,
          closestBlackspot: null,
          lastChecked: null
        };
        
        // Only update if there's a change
        if (prevResult.isNearBlackspot !== newResult.isNearBlackspot || 
            prevResult.nearbyBlackspots.length !== newResult.nearbyBlackspots.length) {
          onProximityChange?.(newResult);
          return newResult;
        }
        return prevResult;
      });
      return;
    }

    const nearbyBlackspots = findNearbyBlackspots(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      sourceBlackspots,
      radiusMeters
    );

    const newResult: ProximityDetectionResult = {
      nearbyBlackspots,
      isNearBlackspot: nearbyBlackspots.length > 0,
      closestBlackspot: nearbyBlackspots.length > 0 ? nearbyBlackspots[0] : null,
      lastChecked: new Date()
    };

    setResult(prevResult => {
      // Only update if there's a meaningful change (including distance changes)
      const prevClosestId = prevResult.closestBlackspot?.blackspot.id;
      const newClosestId = newResult.closestBlackspot?.blackspot.id;
      const prevClosestDist = Math.round(prevResult.closestBlackspot?.distance ?? -1);
      const newClosestDist = Math.round(newResult.closestBlackspot?.distance ?? -1);
      const prevDistances = prevResult.nearbyBlackspots
        .map(nb => `${nb.blackspot.id}:${Math.round(nb.distance)}`)
        .join(',');
      const newDistances = newResult.nearbyBlackspots
        .map(nb => `${nb.blackspot.id}:${Math.round(nb.distance)}`)
        .join(',');

      const changed =
        prevResult.isNearBlackspot !== newResult.isNearBlackspot ||
        prevResult.nearbyBlackspots.length !== newResult.nearbyBlackspots.length ||
        prevClosestId !== newClosestId ||
        prevClosestDist !== newClosestDist ||
        prevDistances !== newDistances;

      if (changed) {
        // Distance-tiered alerts: 500m and 100m with separate cooldown keys
        const triggerDistances = [500, 100];
        for (const nb of newResult.nearbyBlackspots) {
          const { blackspot, distance } = nb;
          for (const d of triggerDistances) {
            const key = `${blackspot.id}_${d}`;
            if (distance <= d && !alertService.isOnCooldown(key)) {
              alertService.triggerBlackspotAlert(blackspot.id, blackspot.title, Math.round(distance));
              alertService.markCooldown(key);
            }
          }
        }

        onProximityChange?.(newResult);
        return newResult;
      }
      return prevResult;
    });
  }, [userLocation?.coords.latitude, userLocation?.coords.longitude, radiusMeters, onProximityChange]);

  // Check proximity immediately when user location changes
  useEffect(() => {
    checkProximity();
  }, [checkProximity]);

  // Set up interval for continuous checking
  useEffect(() => {
    if (!userLocation) return;

    const interval = setInterval(checkProximity, checkIntervalMs);
    return () => clearInterval(interval);
  }, [userLocation, checkProximity, checkIntervalMs]);

  return {
    ...result,
    checkProximity,
    formatDistance
  };
}
