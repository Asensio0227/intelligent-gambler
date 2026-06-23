import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  name: string;
  size?: number;
}

export const Avatar: React.FC<Props> = ({ name, size = 40 }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
};
