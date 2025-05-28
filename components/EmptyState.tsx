import * as React from 'react';
import { StyleSheet, Text, View, Animated, Easing, Platform } from "react-native";
import { ChefHat } from "lucide-react-native";
import colors from "@/constant/colors";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  title, 
  message,

  icon = <ChefHat size={64} color={colors.primary} />
}: EmptyStateProps) {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    ).start();
  }, []);
  
  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.iconContainer,
          Platform.OS !== 'web' ? { transform: [{ translateY }] } : undefined
        ]}
      >
        {icon}
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.primaryLight,
    borderRadius: 50,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
});