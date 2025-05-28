import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { ChefHat, Utensils, Calendar, Heart } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constant/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to LeftoverChef',
    description: 'Turn your leftover ingredients into delicious meals with our smart recipe suggestions.',
    icon: <ChefHat size={80} color="#4CAF50" />,
  },
  {
    id: 2,
    title: 'Smart Recipe Matching',
    description: 'Simply input your available ingredients, and we\'ll find the perfect recipes for you.',
    icon: <Utensils size={80} color="#4CAF50" />,
  },
  {
    id: 3,
    title: 'Meal Planning Made Easy',
    description: 'Plan your weekly meals and reduce food waste with our intuitive meal planner.',
    icon: <Calendar size={80} color="#4CAF50" />,
  },
  {
    id: 4,
    title: 'Save Your Favorites',
    description: 'Keep track of your favorite recipes and build your personal cookbook.',
    icon: <Heart size={80} color="#4CAF50" />,
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

const handleNext = async () => {
  if (currentSlide < slides.length - 1) {
    scrollViewRef.current?.scrollTo({
      x: width * (currentSlide + 1),
      animated: true,
    });
    setCurrentSlide(currentSlide + 1);
  } else {
    await completeOnboarding(); 
  }
};


const handleSkip = async () => {
  await completeOnboarding();
};

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const slide = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slide);
        }}
      >
        {slides.map((slide, index) => (
          <Animated.View
            key={slide.id}
            style={[styles.slide]}
            entering={FadeInRight.delay(index * 100)}
          >
            <View style={styles.iconContainer}>
              {slide.icon}
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </Animated.View>
        ))}
      </ScrollView>

      <Animated.View 
        style={styles.footer}
        entering={FadeIn.delay(400)}
      >
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    backgroundColor: '#E8F5E9',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4CAF50',
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#757575',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});