import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: 'Intelligent Gambler',
  slug: 'intelligent-gambler',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'intelligent-gambler',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.skycodingjr.intelligentgambler',
  },
  android: {
    package: 'com.skycoding.intelligentgambler',
    adaptiveIcon: {
      backgroundColor: '#0f172a',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0f172a',
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
        },
        ios: {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#1a56db',
      },
    ],
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '48f37f7f-4030-4f57-bb45-12a93a341a31',
    },
  },
  owner: 'sky-coding',
});
