import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mumbaiapp.discovery',
  appName: 'Mumbai Discovery',
  webDir: 'public',
  server: {
    url:'https://travel-info-theta.vercel.app/',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
