import { Blackspot } from '@/data/blackspots';
import { getApiBaseUrl, toAbsoluteUrl } from '@/utils/api';

export async function fetchBlackspots(): Promise<Blackspot[]> {
  const base = getApiBaseUrl();
  console.log('[Mobile] Fetching blackspots', { base });
  try {
    const res = await fetch(`${base}/api/blackspots`, { headers: { 'Accept': 'application/json' } });
    console.log('[Mobile] /api/blackspots status:', res.status);
    if (!res.ok) throw new Error(`Failed to load blackspots: ${res.status}`);
    const data = await res.json();
    console.log('[Mobile] /api/blackspots raw:', data);
    if (!Array.isArray(data)) return [];
    const mapped = data.map((d: any) => ({
      id: String(d.id || d._id),
      title: d.title || 'Blackspot',
      description: d.description || '',
      locationText: d.location || d.locationName || d.locationText || '',
      lat: Number(d.lat ?? d.latitude),
      lng: Number(d.lng ?? d.longitude),
      date: d.date || d.dateReported || d.createdAt || '',
      imageUrl: toAbsoluteUrl(base, d.imageUrl) || '',
    })).filter((b: Blackspot) => Number.isFinite(b.lat) && Number.isFinite(b.lng));
    console.log('[Mobile] mapped blackspots count:', mapped.length);
    return mapped;
  } catch (e) {
    console.error('[Mobile] fetchBlackspots error:', (e as Error).message);
    throw e;
  }
}


