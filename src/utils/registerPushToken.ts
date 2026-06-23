import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authService } from '@/services/auth.service';

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    // Push notifications don't work on simulators/emulators
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data;
};

export const registerAndSendPushToken = async (): Promise<void> => {
  try {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await authService.updatePushToken(token);
    }
  } catch (err) {
    // Fail silently — push notifications are non-critical
    console.warn('Push token registration failed:', err);
  }
};
