import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ScalablePressable } from "@/components/ScalablePressable";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { fetchRemotePassword } from "@/services/password";

interface LanguageOption {
  code: "en" | "ar" | "fr";
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fr", name: "French", nativeName: "Français" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const navigation = useNavigation();
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  useEffect(() => {
    // Keep it here for potential future use or just remove if completely unnecessary
    fetchRemotePassword().then((data) => {
      // do nothing for now in Settings
    });
  }, []);

  const handleLanguageSelect = async (code: "en" | "ar" | "fr") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setLanguage(code);
  };

  const openLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(url);
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    rightElement: React.ReactNode,
    index: number,
    iconType: "feather" | "fontawesome" = "feather",
    iconColor?: string,
  ) => (
    <Animated.View
      key={title}
      entering={FadeInDown.delay(index * 50).duration(300)}
    >
      <ScalablePressable
        style={[
          styles.settingItem,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.backgroundRoot },
          ]}
        >
          {iconType === "feather" ? (
            <Feather name={icon as any} size={20} color={iconColor || theme.primary} />
          ) : (
            <FontAwesome name={icon as any} size={20} color={iconColor || theme.primary} />
          )}
        </View>
        <View style={styles.settingInfo}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          <ThemedText
            style={[styles.settingSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </ThemedText>
        </View>
        {rightElement}
      </ScalablePressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.sm,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={24}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <ThemedText style={styles.screenTitle}>{t("settings")}</ThemedText>

        {/* Join Us Section - MOVED TO TOP */}
        <ThemedText
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {t("join_us")}
        </ThemedText>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            "whatsapp",
            t("whatsapp_channel"),
            t("whatsapp_desc"),
            <AnimatedPressButton
              color="#25D366"
              onPress={() =>
                openLink(
                  "https://whatsapp.com/channel/0029Vb7TmNA3QxS8zfeYtr06",
                )
              }
            />,
            0,
            "fontawesome",
            '#25D366',
          )}
          {renderSettingItem(
            "telegram",
            t("telegram_group"),
            t("telegram_desc"),
            <AnimatedPressButton
              color="#0088cc"
              onPress={() => openLink("https://t.me/watchegybest")}
            />,
            1,
            "fontawesome",
            '#0088cc',
          )}
        </View>

        {/* Language Section */}
        <ThemedText
          style={[
            styles.sectionTitle,
            { color: theme.textSecondary, marginTop: Spacing.xl },
          ]}
        >
          {t("language_settings")}
        </ThemedText>
        <View
          style={[
            styles.languageGrid,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          {languages.map((lang) => (
            <ScalablePressable
              key={lang.code}
              onPress={() => handleLanguageSelect(lang.code)}
              style={[
                styles.languageItem,
                {
                  backgroundColor:
                    language === lang.code ? theme.primary : "transparent",
                  borderColor:
                    language === lang.code
                      ? theme.primary
                      : theme.backgroundRoot,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.languageName,
                  { color: language === lang.code ? "#FFFFFF" : theme.text },
                ]}
              >
                {lang.name}
              </ThemedText>
              <ThemedText
                style={[
                  styles.languageNative,
                  {
                    color:
                      language === lang.code
                        ? "rgba(255,255,255,0.7)"
                        : theme.textSecondary,
                  },
                ]}
              >
                {lang.nativeName}
              </ThemedText>
              {language === lang.code && (
                <View style={styles.checkIcon}>
                  <Feather name="check" size={16} color="#FFFFFF" />
                </View>
              )}
            </ScalablePressable>
          ))}
        </View>

        {/* Appearance Section */}
        <ThemedText
          style={[
            styles.sectionTitle,
            { color: theme.textSecondary, marginTop: Spacing.xl },
          ]}
        >
          {t("appearance")}
        </ThemedText>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            "moon",
            t("dark_mode"),
            t("dark_mode_desc") || "Cinematic dark theme always active",
            <Switch
              value={true}
              disabled
              trackColor={{ false: theme.backgroundRoot, true: theme.primary }}
              thumbColor="#FFFFFF"
            />,
            2,
          )}
          {renderSettingItem(
            "play-circle",
            t("auto_play"),
            t("auto_play_desc"),
            <Switch
              value={autoPlayEnabled}
              onValueChange={setAutoPlayEnabled}
              trackColor={{ false: theme.backgroundRoot, true: theme.primary }}
              thumbColor="#FFFFFF"
            />,
            3,
          )}
        </View>

        {/* About Section */}
        <ThemedText
          style={[
            styles.sectionTitle,
            { color: theme.textSecondary, marginTop: Spacing.xl },
          ]}
        >
          {t("about")}
        </ThemedText>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            "info",
            t("version"),
            "1.1.0",
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />,
            4,
          )}
          {renderSettingItem(
            "shield",
            t("privacy_policy"),
            t("privacy_desc"),
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />,
            5,
          )}
          {renderSettingItem(
            "file-text",
            t("terms_of_service"),
            t("terms_desc"),
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />,
            6,
          )}
        </View>

        {/* Branding */}
        <View style={styles.brandingContainer}>
          <ThemedText
            type="logo"
            style={[styles.brandingLogo, { color: theme.primary }]}
          >
            EGYBEST
          </ThemedText>
          <ThemedText
            style={[styles.brandingTagline, { color: theme.textSecondary }]}
          >
            {t("tagline") || "Stream Unlimited Entertainment"}
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

// Animated button for Join Us
const AnimatedPressButton = ({
  color,
  onPress,
}: {
  color: string;
  onPress: () => void;
}) => {
  const { t } = useLanguage();
  return (
    <Animated.View entering={ZoomIn.duration(200)}>
      <ScalablePressable
        onPress={onPress}
        style={[styles.joinButton, { backgroundColor: color }]}
      >
        <ThemedText style={styles.joinButtonText}>{t("join")}</ThemedText>
      </ScalablePressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  screenTitle: {
    fontSize: 28,
    marginBottom: Spacing.xl,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  languageGrid: { borderRadius: BorderRadius.lg, padding: Spacing.sm },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
  },
  languageName: { fontSize: 16, flex: 1 },
  languageNative: { fontSize: 14, marginEnd: Spacing.md },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsGroup: { gap: Spacing.sm },
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
    marginEnd: Spacing.md,
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16 },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  joinButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  joinButtonText: { color: "#FFFFFF", fontSize: 14 },
  brandingContainer: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
    paddingTop: Spacing.xl,
  },
  brandingLogo: { fontSize: 24, letterSpacing: 2 },
  brandingTagline: { fontSize: 12, marginTop: Spacing.xs },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  backButton: { marginEnd: Spacing.md, padding: 4 },
});
