import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  AppState,
  AppStateStatus,
} from "react-native";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";

import {
  shouldPromptForPassword,
  verifyAndStore,
  fetchRemotePassword,
} from "@/services/password";

interface Props {
  onReady: () => void;
}

export const PasswordModal: React.FC<Props> = ({ onReady }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [getCodeLink, setGetCodeLink] = useState<string | undefined>();

  // -----------------------------
  // CHECK REMOTE VS LOCAL ok
  // -----------------------------
  const checkPasswordStatus = async () => {
    try {
      const remote = await fetchRemotePassword();
      const getCode = remote?.getCode;
      if (getCode) setGetCodeLink(getCode);

      const need = await shouldPromptForPassword();

      // If remote password or get-code link is missing, don't show modal
      if (need && remote?.password && getCode) {
        setVisible(true);
      } else {
        setVisible(false);
        onReady();
      }
    } catch (e) {
      console.warn("Password check failed", e);
      onReady(); // allow app if error
    }
  };

  // Initial check
  useEffect(() => {
    checkPasswordStatus();
  }, []);

  // Recheck when app returns foreground (detect GitHub change)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        checkPasswordStatus();
      }
    });
    return () => sub.remove();
  }, []);

  // -----------------------------
  // SUBMIT PASSWORD
  // -----------------------------
  const submit = async () => {
    if (!value || loading) return;

    setLoading(true);
    setError(null);

    const ok = await verifyAndStore(value);

    setLoading(false);

    if (ok) {
      setVisible(false);
      onReady();
      setValue("");
    } else {
      setError("Incorrect password");
    }
  };

  // -----------------------------
  // OPEN GET CODE LINK
  // -----------------------------
  const openGetCode = async () => {
    if (!getCodeLink) {
      Alert.alert("Info", "No code link available");
      return;
    }

    try {
      await require("react-native").Linking.openURL(getCodeLink);
    } catch {
      Alert.alert("Error", "Cannot open link");
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <BlurView intensity={40} tint="light" style={styles.backdrop}>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.container,
            { backgroundColor: theme.backgroundRoot + "ee" },
          ]}
        >
          <ThemedText style={styles.title}>
            {t("enter_password") || "Enter Password"}
          </ThemedText>

          <ThemedText
            weight="600"
            style={[styles.desc, { color: theme.textSecondary }]}
          >
            {t("password_desc") ||
              "If you don\u2019t have the password click Get Code"}
          </ThemedText>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={t("password") || "Password"}
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: theme.primary,
                backgroundColor: theme.backgroundSecondary,
                fontFamily: Fonts.semiBold,
              },
            ]}
          />

          {error && (
            <ThemedText weight="600" style={styles.error}>
              {error}
            </ThemedText>
          )}

          <View style={styles.row}>
            <Pressable
              onPress={submit}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText
                  weight="700"
                  style={[styles.btnText, { color: "#FFFFFF" }]}
                >
                  {t("enter") || "Enter"}
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              onPress={openGetCode}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.backgroundSecondary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <ThemedText weight="700" style={{ color: theme.text }}>
                {t("get_code") || "Get Code"}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "86%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },

  title: {
    fontSize: 20,
    marginBottom: 6,
  },

  desc: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },

  input: {
    height: 48,
    borderWidth: 1.4,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: 16,
  },

  error: {
    color: "#ff6b6b",
    marginBottom: Spacing.sm,
  },

  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },

  button: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
  },
});
