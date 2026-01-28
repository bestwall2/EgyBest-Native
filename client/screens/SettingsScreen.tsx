import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const LANGUAGE_KEY = "@egybest_language";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "en-US", name: "English", nativeName: "English" },
  { code: "ar-SA", name: "Arabic", nativeName: "العربية" },
  { code: "fr-FR", name: "French", nativeName: "Français" },
  { code: "es-ES", name: "Spanish", nativeName: "Español" },
  { code: "pt-BR", name: "Portuguese", nativeName: "Português" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleLanguageSelect = async (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguage(code);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, code);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    rightElement: React.ReactNode,
    index: number
  ) => (
    <Animated.View
      key={title}
      entering={FadeInDown.delay(index * 50).duration(300)}
    >
      <View style={[styles.settingItem, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundRoot }]}>
          <Feather name={icon as any} size={20} color={theme.primary} />
        </View>
        <View style={styles.settingInfo}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          <ThemedText style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </ThemedText>
        </View>
        {rightElement}
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <ThemedText style={styles.screenTitle}>Settings</ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Language
        </ThemedText>
        <View style={[styles.languageGrid, { backgroundColor: theme.backgroundSecondary }]}>
          {languages.map((lang, index) => (
            <Pressable
              key={lang.code}
              onPress={() => handleLanguageSelect(lang.code)}
              style={[
                styles.languageItem,
                {
                  backgroundColor:
                    selectedLanguage === lang.code ? theme.primary : "transparent",
                  borderColor:
                    selectedLanguage === lang.code ? theme.primary : theme.backgroundRoot,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.languageName,
                  { color: selectedLanguage === lang.code ? "#FFFFFF" : theme.text },
                ]}
              >
                {lang.name}
              </ThemedText>
              <ThemedText
                style={[
                  styles.languageNative,
                  { color: selectedLanguage === lang.code ? "rgba(255,255,255,0.7)" : theme.textSecondary },
                ]}
              >
                {lang.nativeName}
              </ThemedText>
              {selectedLanguage === lang.code ? (
                <View style={styles.checkIcon}>
                  <Feather name="check" size={16} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: Spacing.xl }]}>
          Preferences
        </ThemedText>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            "bell",
            "Notifications",
            "Get notified about new releases",
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.backgroundRoot, true: theme.primary }}
              thumbColor="#FFFFFF"
            />,
            0
          )}
          {renderSettingItem(
            "play-circle",
            "Auto-play",
            "Automatically play next episode",
            <Switch
              value={autoPlayEnabled}
              onValueChange={setAutoPlayEnabled}
              trackColor={{ false: theme.backgroundRoot, true: theme.primary }}
              thumbColor="#FFFFFF"
            />,
            1
          )}
        </View>

        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: Spacing.xl }]}>
          About
        </ThemedText>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            "info",
            "Version",
            "1.0.0",
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />,
            2
          )}
          {renderSettingItem(
            "shield",
            "Privacy Policy",
            "How we protect your data",
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />,
            3
          )}
          {renderSettingItem(
            "file-text",
            "Terms of Service",
            "Usage terms and conditions",
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />,
            4
          )}
        </View>

        <View style={styles.brandingContainer}>
          <ThemedText style={[styles.brandingLogo, { color: theme.primary }]}>
            EGYBEST
          </ThemedText>
          <ThemedText style={[styles.brandingTagline, { color: theme.textSecondary }]}>
            Stream Unlimited Entertainment
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  languageGrid: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  languageNative: {
    fontSize: 14,
    marginRight: Spacing.md,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsGroup: {
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  brandingContainer: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
    paddingTop: Spacing.xl,
  },
  brandingLogo: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  brandingTagline: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
