'use client';
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { useRouter } from 'next/navigation';

export default function AppListenerWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).Capacitor || !(window as any).Capacitor.isNative) return;

    const setupListeners = async () => {
      await App.addListener('appUrlOpen', (event: any) => {
        Browser.close();
        
        const path = event.url.split('mumbaiapp://').pop();
        if (path) {
          router.push(`/${path}`);
        }
      });

      await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    };

    setupListeners();

    return () => {
      App.removeAllListeners();
    };
  }, [router]);

  return <>{children}</>;
}
