import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<Props> = ({ message = 'Something went wrong', onRetry }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 24 }}>
    <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
    <Text style={{ color: COLORS.text, fontSize: 16, textAlign: 'center', marginBottom: 8 }}>{message}</Text>
    {onRetry && (
      <TouchableOpacity
        onPress={onRetry}
        style={{ marginTop: 16, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);
