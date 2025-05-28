import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  index?: number;
}

export default function StatCard({ title, value, icon, index = 0 }: StatCardProps) {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInUp.delay(index * 200)}
      layout={Layout.springify()}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Animated.Text 
        style={styles.value}
        entering={FadeInUp.delay((index * 200) + 100)}
      >
        {value}
      </Animated.Text>
      <Text style={styles.title}>{title}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#212121',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
});