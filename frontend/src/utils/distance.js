// Distance utilities for geospatial calculations

const EARTH_RADIUS_METERS = 6371000; // mean Earth radius

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMeters(a, b) {
  if (!a || !b) return NaN;
  const lat1 = Number(a.lat);
  const lon1 = Number(a.lng ?? a.lon ?? a.longitude);
  const lat2 = Number(b.lat);
  const lon2 = Number(b.lng ?? b.lon ?? b.longitude);

  if ([lat1, lon1, lat2, lon2].some((v) => Number.isNaN(v))) return NaN;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h = sinDLat * sinDLat + Math.cos(rLat1) * Math.cos(rLat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

export function getNearbyBlackspots(userPosition, blackspots, options = {}) {
  const { minMeters = 0, maxMeters = 600 } = options;
  if (!userPosition || !Array.isArray(blackspots)) return [];

  const withDistance = blackspots.map((spot) => ({
    spot,
    distanceMeters: haversineDistanceMeters(
      { lat: userPosition[0] ?? userPosition.lat, lng: userPosition[1] ?? userPosition.lng },
      { lat: spot.lat, lng: spot.lng }
    ),
  }));

  return withDistance
    .filter((d) => Number.isFinite(d.distanceMeters) && d.distanceMeters >= minMeters && d.distanceMeters <= maxMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function findClosestBlackspot(userPosition, blackspots) {
  const nearby = getNearbyBlackspots(userPosition, blackspots, { minMeters: 0, maxMeters: Number.POSITIVE_INFINITY });
  return nearby.length > 0 ? nearby[0] : null;
}


