import React from 'react';
import { RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { IFixture } from '@/types/fixture.types';
import { FixtureCard } from './FixtureCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS } from '@/constants/colors';

interface Props {
  fixtures: IFixture[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const FixtureList: React.FC<Props> = ({ fixtures, refreshing = false, onRefresh }) => (
  <FlashList
          estimatedItemSize={80}
    data={fixtures}
    keyExtractor={(item) => item._id}
    renderItem={({ item }) => <FixtureCard fixture={item} />}
    refreshControl={
      onRefresh ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      ) : undefined
    }
    ListEmptyComponent={
      <EmptyState icon="📅" title="No fixtures found" subtitle="Check back later or adjust your filters" />
    }
    contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
  />
);
