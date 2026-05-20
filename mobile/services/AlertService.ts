import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

interface AlertCooldown {
  [blackspotId: string]: number;
}

class AlertService {
  private cooldownTimers: AlertCooldown = {};
  private readonly COOLDOWN_DURATION = 30000; // 30 seconds cooldown
  private isInitialized = false;
  // Force Indian English; we won't select alternative accents

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Basic availability guard: if speak is missing, skip
      if (typeof Speech.speak !== 'function') {
        console.warn('Speech synthesis not available on this device');
        return;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AlertService:', error);
      // Still mark as initialized to allow fallback behavior
      this.isInitialized = true;
    }
  }

  async triggerBlackspotAlert(blackspotId: string, blackspotTitle: string, distance: number) {
    // Check cooldown
    if (this.isInCooldown(blackspotId)) {
      console.log(`Alert for blackspot ${blackspotId} is in cooldown`);
      return;
    }

    try {
      // Set cooldown
      this.setCooldown(blackspotId);

      // Trigger vibration
      await this.triggerVibration();

      // Trigger voice alert
      await this.triggerVoiceAlert(blackspotTitle, distance);

      console.log(`Alert triggered for blackspot: ${blackspotTitle} (${distance}m away)`);
    } catch (error) {
      console.error('Failed to trigger blackspot alert:', error);
    }
  }

  private async triggerVibration() {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Use haptic feedback for 6 seconds
        const vibrationInterval = setInterval(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200); // Heavy impact every 200ms for 6 seconds

        setTimeout(() => {
          clearInterval(vibrationInterval);
        }, 5000); // run for ~5 seconds
      } else {
        // Android: Use system vibration
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        // Additional continuous vibration for 5 seconds
        Vibration.vibrate(5000);
      }
    } catch (error) {
      console.error('Failed to trigger vibration:', error);
    }
  }

  private async triggerVoiceAlert(blackspotTitle: string, distance: number) {
    try {
      // Build messages (English first, then Marathi)
      const englishMessage = `Warning! You are approaching ${blackspotTitle}. Distance: ${distance} meters. Please drive carefully.`;
      const marathiMessage = `सावधान! आपण ${blackspotTitle} जवळ येत आहात. अंतर: ${distance} मीटर. कृपया काळजीपूर्वक वाहन चालवा.`;

      // Determine available voices for Marathi/Indian accent
      const voices = (await (Speech as any).getAvailableVoicesAsync?.()) || [];
      const findVoice = (pred: (v: any) => boolean) => voices.find(pred)?.identifier;
      const mrVoice = findVoice((v) => /(^|-)mr(-|$)/i.test(v.language || ''))
        || findVoice((v) => /marathi/i.test(v.name || ''));
      const hiVoice = findVoice((v) => /(^|-)hi(-|$)/i.test(v.language || ''))
        || findVoice((v) => /hindi/i.test(v.name || ''))
        || findVoice((v) => /india|indian/i.test(v.name || ''));
      const enVoice = findVoice((v) => /en-IN/i.test(v.language || ''))
        || findVoice((v) => /en(.*)(india|indian)/i.test(v.name || ''))
        || undefined;

      // Helper to await Speech.speak completion
      const speakAsync = (text: string, options: Speech.SpeechOptions = {}) => new Promise<void>((resolve, reject) => {
        try {
          Speech.speak(text, {
            ...options,
            onDone: () => { (options as any).onDone?.(); resolve(); },
            onStopped: () => { (options as any).onStopped?.(); resolve(); },
            onError: (err: any) => { (options as any).onError?.(err); reject(err); },
          } as Speech.SpeechOptions);
        } catch (err) {
          reject(err);
        }
      });

      // Speak English first
      await speakAsync(englishMessage, {
        language: 'en-IN',
        voice: enVoice,
        pitch: 1.0,
        rate: Platform.OS === 'android' ? 1.0 : 0.85,
        volume: 1.0,
      });

      // Then Marathi (fallback to Hindi, else repeat English if neither available)
      const marathiOptions: Speech.SpeechOptions = mrVoice
        ? { language: 'mr-IN', voice: mrVoice }
        : hiVoice
          ? { language: 'hi-IN', voice: hiVoice }
          : { language: 'en-IN', voice: enVoice };

      await speakAsync(marathiMessage, {
        ...marathiOptions,
        pitch: 1.0,
        rate: Platform.OS === 'android' ? 1.0 : 0.9,
        volume: 1.0,
      });
    } catch (error) {
      console.error('Failed to trigger voice alert:', error);
      // Fallback: Log the message
      this.fallbackVoiceAlert(blackspotTitle, distance);
    }
  }

  private fallbackVoiceAlert(blackspotTitle: string, distance: number) {
    const message = `VOICE ALERT: Warning! You are approaching ${blackspotTitle}. Distance: ${distance} meters. Please drive carefully.`;
    console.log(message);
    
    // In a real app, you might want to show a visual alert or use a different TTS library
    // For now, we'll just log it
  }

  // Public wrappers for external distance-tier cooldown checks
  public isOnCooldown(key: string): boolean {
    return this.isInCooldown(key);
  }

  public markCooldown(key: string) {
    this.setCooldown(key);
  }

  private isInCooldown(blackspotId: string): boolean {
    const lastAlertTime = this.cooldownTimers[blackspotId];
    if (!lastAlertTime) return false;
    
    const now = Date.now();
    return (now - lastAlertTime) < this.COOLDOWN_DURATION;
  }

  private setCooldown(blackspotId: string) {
    this.cooldownTimers[blackspotId] = Date.now();
  }

  // Clean up resources
  async cleanup() {
    // Stop any ongoing speech
    await Speech.stop();
  }

  // Get remaining cooldown time for a blackspot
  getRemainingCooldown(blackspotId: string): number {
    const lastAlertTime = this.cooldownTimers[blackspotId];
    if (!lastAlertTime) return 0;
    
    const now = Date.now();
    const elapsed = now - lastAlertTime;
    return Math.max(0, this.COOLDOWN_DURATION - elapsed);
  }
}

// Export singleton instance
export const alertService = new AlertService();
