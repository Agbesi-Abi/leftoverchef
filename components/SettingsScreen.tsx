import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export default function SettingsScreen() {
  const {
    theme,
    toggleTheme,
    notificationsEnabled,
    toggleNotifications,
    language,
    setLanguage,
  } = usePreferencesStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dark Mode</Text>
      <Switch value={theme === 'dark'} onValueChange={toggleTheme} />

      <Text style={styles.label}>Notifications</Text>
      <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />

      <Text style={styles.label}>Language: {language}</Text>
      <View style={styles.languageOptions}>
        {['en', 'fr', 'es'].map((lang) => (
          <Text
            key={lang}
            style={[
              styles.languageOption,
              language === lang && styles.activeLanguage,
            ]}
            onPress={() => setLanguage(lang)}
          >
            {lang.toUpperCase()}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  label: { fontSize: 16, marginTop: 16 },
  languageOptions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  languageOption: {
    fontSize: 16,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  activeLanguage: {
    backgroundColor: '#2196F3',
    color: '#fff',
  },
});
