import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import DetailScreen from "@/screens/DetailScreen";
import WatchScreen from "@/screens/WatchScreen";
import PersonScreen from "@/screens/PersonScreen";
import SettingsScreen from "@/screens/SettingsScreen";
// ExploreAllScreen removed
import FullscreenWatchScreen from "@/screens/FullscreenWatchScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { MediaType } from "@/types/tmdb";

export type RootStackParamList = {
  Main: undefined;
  Detail: { id: number; mediaType: MediaType };
  Watch: {
    id: number;
    mediaType: MediaType;
    title: string;
    season?: number;
    episode?: number;
    selectedServer?: string;
  };
  Person: { id: number };
  Settings: undefined;
  // ExploreAll route removed
  FullscreenWatch: { videoUrl: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Watch"
        component={WatchScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Person"
        component={PersonScreen}
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* ExploreAll screen removed */}
      <Stack.Screen
        name="FullscreenWatch"
        component={FullscreenWatchScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
