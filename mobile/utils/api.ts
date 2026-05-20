import { Platform } from 'react-native';

export function getApiBaseUrl(): string {
  // Prefer Expo public env; fallback to emulator-appropriate localhost
  const envUrl = (process as any).env?.EXPO_PUBLIC_API_URL || (global as any).__expo?.env?.EXPO_PUBLIC_API_URL;
  const fallback = Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';
  return (typeof envUrl === 'string' && envUrl.length > 0) ? envUrl : fallback;
}

export function toAbsoluteUrl(baseUrl: string, url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return url;
}

