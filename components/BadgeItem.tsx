import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

type BadgeItemProps = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  onPress?: () => void;
};

export default function BadgeItem({
  id,
  name,
  description,
  icon,
  unlocked,
  onPress,
  index = 0
}: BadgeItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, !unlocked && styles.lockedContainer]}
      onPress={onPress}
      disabled={unlocked}
      activeOpacity={unlocked ? 1 : 0.7}
    >
      <Animated.View 
        entering={FadeInDown.delay(index * 100)}
        layout={Layout.springify()}
      >
        <View style={[styles.iconContainer, !unlocked && styles.lockedIconContainer]}>
          {icon}
        </View>
        <Text style={[styles.name, !unlocked && styles.lockedText]}>{name}</Text>
        <Text style={[styles.description, !unlocked && styles.lockedText]}>
          {description}
        </Text>
        {!unlocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>Locked</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  lockedContainer: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lockedIconContainer: {
    backgroundColor: '#EEEEEE',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  lockedText: {
    color: '#9E9E9E',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#9E9E9E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#FFFFFF',
  },
});