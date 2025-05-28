import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { useStats } from '@/contexts/StatsProvider';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/StatCard';
import BadgeItem from '@/components/BadgeItem';
import { CircleCheck as CheckCircle, Trophy, Utensils, Star, Clock, Globe, Settings, LogOut, User } from 'lucide-react-native';
import React from 'react';

export default function StatsScreen() {
  const { stats } = useStats();
  const { user, signOut } = useAuth();
  
  const badges = [
    {
      id: 'waste-warrior',
      name: 'Waste Warrior',
      description: 'Used leftovers for 5+ meals',
      icon: <Utensils size={24} color="#FFD700" />,
      unlocked: stats.mealsMade >= 5,
    },
    {
      id: 'healthy-hero',
      name: 'Healthy Hero',
      description: 'Made 10 nutritious meals',
      icon: <CheckCircle size={24} color="#4CAF50" />,
      unlocked: stats.mealsMade >= 10,
    },
    {
      id: 'recipe-explorer',
      name: 'Recipe Explorer',
      description: 'Viewed 20+ recipes',
      icon: <Globe size={24} color="#2196F3" />,
      unlocked: stats.recipesViewed >= 20,
    },
    {
      id: 'super-saver',
      name: 'Super Saver',
      description: 'Saved 15 recipes to favorites',
      icon: <Star size={24} color="#FF9800" />,
      unlocked: stats.recipesSaved >= 15,
    },
    {
      id: 'efficient-cook',
      name: 'Efficient Cook',
      description: 'Made 3 recipes in one week',
      icon: <Clock size={24} color="#9C27B0" />,
      unlocked: stats.mealsMade >= 3,
    },
    {
      id: 'master-chef',
      name: 'Master Chef',
      description: 'Made 25 meals from leftovers',
      icon: <Trophy size={24} color="#F44336" />,
      unlocked: stats.mealsMade >= 25,
    },
  ];
  
  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <User size={32} color="#757575" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Settings size={24} color="#424242" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.logoutButton]}
                onPress={signOut}
              >
                <LogOut size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard
            title="Meals Made"
            value={stats.mealsMade}
            icon={<Utensils size={28} color="#4CAF50" />}
          />
          <StatCard
            title="Recipes Viewed"
            value={stats.recipesViewed}
            icon={<CheckCircle size={28} color="#2196F3" />}
          />
          <StatCard
            title="Recipes Saved"
            value={stats.recipesSaved}
            icon={<Star size={28} color="#FF9800" />}
          />
        </View>
        
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          
          {unlockedBadges.length > 0 ? (
            <View style={styles.badgesContainer}>
              {unlockedBadges.map((badge) => (
                <BadgeItem
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  icon={badge.icon}
                  unlocked={true}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyBadgesContainer}>
              <Trophy size={40} color="#CCCCCC" />
              <Text style={styles.emptyBadgesText}>
                No badges earned yet. Keep using the app to earn them!
              </Text>
            </View>
          )}
          
          {lockedBadges.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                Badges to Unlock
              </Text>
              <View style={styles.badgesContainer}>
                {lockedBadges.map((badge) => (
                  <BadgeItem
                    key={badge.id}
                    name={badge.name}
                    description={badge.description}
                    icon={badge.icon}
                    unlocked={false}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        <TouchableOpacity 
          style={styles.logoutContainer}
          onPress={handleLogout}
        >
          <LogOut size={24} color="#F44336" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 1,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#212121',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    flexWrap: 'wrap',
  },
  badgesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#212121',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyBadgesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
  },
  emptyBadgesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#F44336',
    marginLeft: 8,
  },
});