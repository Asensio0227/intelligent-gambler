import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  message?: string;
}

export const LoadingScreen: React.FC<Props> = ({ message = 'Loading...' }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 14 }}>{message}</Text>
  </View>
);
