import React from "react";
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Clipboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "./ThemedText";

interface VideoLinksModalProps {
  isVisible: boolean;
  links: string[];
  onClose: () => void;
}

export const VideoLinksModal: React.FC<VideoLinksModalProps> = ({
  isVisible,
  links,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();

  const copyToClipboard = (link: string) => {
    Clipboard.setString(link);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Optionally, show a toast message
  };

  const renderLinkItem = ({ item }: { item: string }) => (
    <View
      style={[styles.linkItem, { backgroundColor: theme.backgroundSecondary }]}
    >
      <ThemedText style={styles.linkText} numberOfLines={1}>
        {item}
      </ThemedText>
      <Pressable
        onPress={() => copyToClipboard(item)}
        style={styles.copyButton}
      >
        <Feather name="copy" size={20} color={theme.text} />
      </Pressable>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View
          style={[
            styles.modalView,
            { backgroundColor: theme.backgroundRoot, paddingTop: insets.top },
          ]}
        >
          <Pressable
            onPress={onClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: theme.backgroundSecondary,
                [isRTL ? "left" : "right"]: Spacing.md,
              },
            ]}
          >
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
          <ThemedText weight="bold" style={styles.modalTitle}>
            {t("captured_links")}
          </ThemedText>
          {links.length > 0 ? (
            <FlatList
              data={links}
              renderItem={renderLinkItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              style={styles.linksList}
              contentContainerStyle={styles.linksListContent}
            />
          ) : (
            <View style={styles.noLinksContainer}>
              <Feather name="info" size={40} color={theme.textSecondary} />
              <ThemedText
                style={[styles.noLinksText, { color: theme.textSecondary }]}
              >
                {t("no_links_captured")}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    width: "100%",
    height: "75%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: Spacing.lg,
  },
  linksList: {
    width: "100%",
  },
  linksListContent: {
    paddingBottom: Spacing.xl,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  linkText: {
    flex: 1,
    marginEnd: Spacing.md,
    fontSize: 14,
  },
  copyButton: {
    padding: Spacing.sm,
  },
  noLinksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noLinksText: {
    marginTop: Spacing.md,
    fontSize: 16,
  },
});
