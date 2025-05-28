import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useStats } from '@/contexts/StatsProvider';
// import BadgesSection from '@/components/badges/BadgesSection';
import BadgeUnlockModal from '@/components/BadgeUnlockModal';
// import { badges } from '@/data/badges';
import colors from '@/constant/colors';
import * as Haptics from 'expo-haptics';

export default function BadgesScreen() {
  const { stats } = useStats();
  const [selectedBadge, setSelectedBadge] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);

  const unlockedBadges = badges.filter(badge => badge.requirement(stats));
  const lockedBadges = badges.filter(badge => !badge.requirement(stats));

  const handleBadgePress = (badge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBadge(badge);
    setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <BadgesSection
        unlockedBadges={unlockedBadges}
        lockedBadges={lockedBadges}
        onBadgePress={handleBadgePress}
      /> */}

      <BadgeUnlockModal
        isVisible={showModal}
        badge={selectedBadge}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});