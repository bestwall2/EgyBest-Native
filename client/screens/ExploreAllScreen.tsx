import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { MediaCard } from "@/components/MediaCard";
import { MediaCardSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { getQueryFn } from "@/lib/query-client";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Movie, TVShow, MediaType } from "@/types/tmdb";
import { isMovie } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExploreAllRouteProp = RouteProp<RootStackParamList, "ExploreAll">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 4) / 3;

export default function ExploreAllScreen() {
  const route = useRoute<ExploreAllRouteProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const { title, endpoint, mediaType } = route.params || {};

  // Guard clause to prevent rendering if navigation params are missing
  if (!endpoint) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme?.backgroundRoot || "#000" },
        ]}
      >
        <ThemedText>{t("exploreAllScreen.noEndpointMessage")}</ThemedText>
      </View>
    );
  import React, { useCallback, useMemo, useState } from "react";
  import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
  } from "react-native";
  import { useSafeAreaInsets } from "react-native-safe-area-context";
  import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
  import { NativeStackNavigationProp } from "@react-navigation/native-stack";
  import { useInfiniteQuery } from "@tanstack/react-query";

  import { MediaCard } from "@/components/MediaCard";
  import { MediaCardSkeleton } from "@/components/SkeletonLoader";
  import { EmptyState } from "@/components/EmptyState";
  import { ThemedText } from "@/components/ThemedText";
  import { getQueryFn } from "@/lib/query-client";
  import { useTheme } from "@/hooks/useTheme";
  import { useLanguage } from "@/context/LanguageContext";
  import { Spacing } from "@/constants/theme";
  import { RootStackParamList } from "@/navigation/RootStackNavigator";
  import { Movie, TVShow, MediaType } from "@/types/tmdb";
  import { isMovie } from "@/utils/helpers";

  type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  type ExploreAllRouteProp = RouteProp<RootStackParamList, "ExploreAll">;

  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 4) / 3;

  export default function ExploreAllScreen() {
    const route = useRoute<ExploreAllRouteProp>();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<NavigationProp>();

    const params = route.params || {};
    const endpoint = params.endpoint as string | undefined;
    const title = (params.title as string) || t("exploreAllScreen.title");

    if (!endpoint) {
      return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}> 
          <EmptyState image={require("../../assets/images/icon.png")} title={t("unable_load")} message={t("exploreAllScreen.noEndpointMessage")} />
        </View>
      );
    // ExploreAllScreen removed. BrowseTab is used instead.
    import React from "react";
    import { View, StyleSheet } from "react-native";
    import { EmptyState } from "@/components/EmptyState";
    import { useTheme } from "@/hooks/useTheme";
    import { useLanguage } from "@/context/LanguageContext";

    export default function ExploreAllScreen() {
      const { theme } = useTheme();
      const { t } = useLanguage();
      return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}> 
          <EmptyState
            image={require("../../assets/images/icon.png")}
            title={t("no_results")}
            message={t("exploreAllScreen.removed") || "This screen has been removed. Use Browse."}
          />
        </View>
      );
    }

    const styles = StyleSheet.create({ container: { flex: 1 } });
        if (!Number.isFinite(page) || !Number.isFinite(total)) return undefined;
