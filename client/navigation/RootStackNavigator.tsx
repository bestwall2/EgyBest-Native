import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import DetailScreen from "@/screens/DetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { MediaType } from "@/types/tmdb";

export type RootStackParamList = {
  Main: undefined;
  Detail: { id: number; mediaType: MediaType };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
}
