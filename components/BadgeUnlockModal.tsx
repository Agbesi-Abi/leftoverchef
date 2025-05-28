import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import colors from '@/constant/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type BadgeUnlockModalProps = {
  isVisible: boolean;
  onClose: () => void;
  badge: {
    name: string;
    description: string;
    icon: React.ReactNode;
  } | null;
};

export default function BadgeUnlockModal({ isVisible, onClose, badge }: BadgeUnlockModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          >
            <X size={24} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.badgeIconContainer}>
            {badge?.icon}
          </View>

          <Text style={styles.congratsText}>Congratulations! 🎉</Text>
          <Text style={styles.badgeName}>{badge?.name}</Text>
          <Text style={styles.badgeDescription}>{badge?.description}</Text>

          <TouchableOpacity 
            style={styles.closeButtonBottom}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          >
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  badgeIconContainer: {
    backgroundColor: colors.primaryLight + '20',
    padding: 24,
    borderRadius: 50,
    marginBottom: 24,
    transform: [{ scale: 1.5 }],
  },
  congratsText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButtonBottom: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});