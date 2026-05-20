/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a specified radius of another point
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @param targetLat - Target point's latitude
 * @param targetLng - Target point's longitude
 * @param radiusMeters - Radius in meters (default: 500)
 * @returns True if within radius, false otherwise
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number = 500
): boolean {
  const distance = calculateDistance(userLat, userLng, targetLat, targetLng);
  return distance <= radiusMeters;
}

/**
 * Find all blackspots within a specified radius of the user's location
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @param blackspots - Array of blackspot objects
 * @param radiusMeters - Radius in meters (default: 500)
 * @returns Array of nearby blackspots with their distances
 */
export function findNearbyBlackspots(
  userLat: number,
  userLng: number,
  blackspots: Array<{ lat: number; lng: number; [key: string]: any }>,
  radiusMeters: number = 500
): Array<{ blackspot: any; distance: number }> {
  const nearbyBlackspots: Array<{ blackspot: any; distance: number }> = [];
  
  blackspots.forEach((blackspot) => {
    const distance = calculateDistance(userLat, userLng, blackspot.lat, blackspot.lng);
    if (distance <= radiusMeters) {
      nearbyBlackspots.push({
        blackspot,
        distance: Math.round(distance)
      });
    }
  });
  
  // Sort by distance (closest first)
  return nearbyBlackspots.sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display
 * @param distanceMeters - Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`;
  } else {
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  }
}
