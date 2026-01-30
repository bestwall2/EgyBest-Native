import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Text,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { shouldPromptForPassword, verifyAndStore } from "@/services/password";

interface PasswordModalProps {
  onReady: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ onReady }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const should = await shouldPromptForPassword();
      if (!mounted) return;
      setVisible(should);
      setLoading(false);
      if (!should) onReady();
    })();
    return () => {
      mounted = false;
    };
  }, [onReady]);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const ok = await verifyAndStore(value);
    setLoading(false);
    if (ok) {
      setVisible(false);
      onReady();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        >
          <ThemedText
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginBottom: Spacing.md,
            }}
          >
            Enter Password
          </ThemedText>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.backgroundSecondary },
            ]}
          />
          {error ? (
            <Text style={{ color: "#ff6b6b", marginTop: 8 }}>{error}</Text>
          ) : null}
          <View style={{ flexDirection: "row", marginTop: Spacing.md }}>
            <Pressable
              onPress={submit}
              style={[styles.button, { backgroundColor: theme.primary }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={{ color: "#fff" }}>Submit</ThemedText>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    width: "86%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "stretch",
  },
  input: { padding: Spacing.md, borderRadius: BorderRadius.md },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
