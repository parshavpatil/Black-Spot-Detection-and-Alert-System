import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { alertService } from '@/services/AlertService';

interface AppState {
  isTracking: boolean;
  hasLocationPermission: boolean;
  userLocation: Location.LocationObject | null;
  isInitialized: boolean;
  error: string | null;
  locationSubscription: Location.LocationSubscription | null;
}

interface AppContextType extends AppState {
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  requestLocationPermission: () => Promise<boolean>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    isTracking: false,
    hasLocationPermission: false,
    userLocation: null,
    isInitialized: false,
    error: null,
    locationSubscription: null,
  });

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      setState(prev => ({ 
        ...prev, 
        hasLocationPermission: hasPermission,
        error: hasPermission ? null : 'Location permission denied'
      }));
      
      return hasPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request location permission';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    }
  };

  const startTracking = async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Request permission if not already granted
      if (!state.hasLocationPermission) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          return;
        }
      }

      // Initialize alert service
      await alertService.initialize();

      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        setState(prev => ({ 
          ...prev, 
          error: 'Location services are disabled. Please enable them in your device settings.',
          isInitialized: true 
        }));
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      setState(prev => ({
        ...prev,
        isTracking: true,
        userLocation: location,
        isInitialized: true,
      }));

      // Start continuous location updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setState(prev => ({
            ...prev,
            userLocation: newLocation,
          }));
          console.log('Location updated:', {
            lat: newLocation.coords.latitude,
            lng: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy
          });
        }
      );

      // Store subscription for cleanup
      setState(prev => ({
        ...prev,
        locationSubscription,
      }));

      console.log('Location tracking started successfully');
    } catch (error) {
      let errorMessage = 'Failed to start tracking';
      
      if (error instanceof Error) {
        if (error.message.includes('location services')) {
          errorMessage = 'Location services are disabled. Please enable them in your device settings.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Location permission denied. Please grant permission in settings.';
        } else if (error.message.includes('unavailable')) {
          errorMessage = 'Location is currently unavailable. Please check your GPS settings.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isInitialized: true 
      }));
      console.error('Failed to start tracking:', error);
    }
  };

  const stopTracking = () => {
    // Stop location subscription if active
    if (state.locationSubscription) {
      state.locationSubscription.remove();
    }
    
    setState(prev => ({
      ...prev,
      isTracking: false,
      locationSubscription: null,
    }));
    
    // Clean up alert service
    alertService.cleanup();
    console.log('Location tracking stopped');
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Auto-start on app launch
  useEffect(() => {
    const autoStart = async () => {
      try {
        // Small delay to ensure app is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we already have permission
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          await startTracking();
        } else {
          // Request permission and start if granted
          const hasPermission = await requestLocationPermission();
          if (hasPermission) {
            await startTracking();
          } else {
            // Set initialized even if permission denied
            setState(prev => ({ 
              ...prev, 
              isInitialized: true 
            }));
          }
        }
      } catch (error) {
        console.error('Auto-start failed:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to auto-start location tracking. Please try starting manually.',
          isInitialized: true 
        }));
      }
    };

    autoStart();
  }, []);

  // Cleanup location subscription on unmount
  useEffect(() => {
    return () => {
      if (state.locationSubscription) {
        state.locationSubscription.remove();
      }
    };
  }, [state.locationSubscription]);

  const value: AppContextType = {
    ...state,
    startTracking,
    stopTracking,
    requestLocationPermission,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
