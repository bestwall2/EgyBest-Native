import React from "react";
import { StyleSheet, LogBox, Platform, I18nManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { LanguageProvider } from "@/context/LanguageContext";
import { useUpdates } from "@/hooks/useUpdates";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

if (Platform.OS === "web") {
  LogBox.ignoreLogs(["props.pointerEvents is deprecated"]);
}

// Enable RTL support as early as possible
I18nManager.allowRTL(true);

const AppUpdater = () => {
  useUpdates();
  return null;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    "Cairo-Black": require("./../assets/fonts/Cairo-Black.ttf"),
    "Cairo-Bold": require("./../assets/fonts/Cairo-Bold.ttf"),
    "Cairo-ExtraBold": require("./../assets/fonts/Cairo-ExtraBold.ttf"),
    "Cairo-ExtraLight": require("./../assets/fonts/Cairo-ExtraLight.ttf"),
    "Cairo-Light": require("./../assets/fonts/Cairo-Light.ttf"),
    "Cairo-Medium": require("./../assets/fonts/Cairo-Medium.ttf"),
    "Cairo-Regular": require("./../assets/fonts/Cairo-Regular.ttf"),
    "Cairo-SemiBold": require("./../assets/fonts/Cairo-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null; // wait until font loads
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AppUpdater />
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <NavigationContainer>
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="light" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
