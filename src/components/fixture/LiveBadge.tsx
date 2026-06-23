import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';

export const LiveBadge: React.FC = () => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.live, opacity: pulse }} />
      <Text style={{ color: COLORS.live, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>LIVE</Text>
    </View>
  );
};
