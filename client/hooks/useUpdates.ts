import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert } from "react-native";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Hook to handle Expo OTA updates.
 * In development, it does nothing.
 * In production, it checks for updates on mount and prompts the user to restart if an update is found.
 */
export const useUpdates = () => {
  const { t } = useLanguage();

  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(t("update_available"), t("update_msg"), [
            {
              text: t("later"),
              style: "cancel",
            },
            {
              text: t("restart"),
              onPress: () => Updates.reloadAsync(),
            },
          ]);
        }
      } catch (error) {
        // Silently fail or log to an error reporting service
        console.warn(`Error fetching latest Expo update: ${error}`);
      }
    }

    // Only run update checks in non-development environments
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, [t]);
};
