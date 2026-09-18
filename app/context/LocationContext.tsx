'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface LocationContextType {
  userCoords: { lat: number; lng: number } | null;
  loadingLocation: boolean;
}

const LocationContext = createContext<LocationContextType>({ userCoords: null, loadingLocation: true });

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    const requestInitialLocation = async () => {
      if (typeof window === 'undefined') return;
      const isMobileAPK = (window as any).Capacitor && (window as any).Capacitor.isNative;

      try {
        if (isMobileAPK) {
          const permissions = await Geolocation.checkPermissions();
          if (permissions.location !== 'granted') {
            const request = await Geolocation.requestPermissions();
            if (request.location !== 'granted') {
              setLoadingLocation(false);
              return;
            }
          }
          const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.warn("Browser GPS bypass:", err),
            { timeout: 7000 }
          );
        }
      } catch (err) {
        console.error("Initial GPS request timed out:", err);
      } finally {
        setLoadingLocation(false);
      }
    };

    requestInitialLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ userCoords, loadingLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
