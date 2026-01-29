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
      <View style={[styles.container, { backgroundColor: theme?.backgroundRoot || "#000" }]}>
        <ThemedText>{t("exploreAllScreen.noEndpointMessage")}</ThemedText>
      </View>
    );
  }

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
  } = useInfiniteQuery<{
    results: (Movie | TVShow)[];
    page: number;
    total_pages: number;
  }>({
    queryKey: [endpoint],
    initialPageParam: 1,
    queryFn: getQueryFn({ on401: "throw" }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (typeof lastPage.page !== "number" || typeof lastPage.total_pages !== "number") return undefined;
      return lastPage.page < lastPage.total_pages && lastPage.page < 500 ? lastPage.page + 1 : undefined;
    },
  });

  const allItems = data?.pages?.flatMap((page) => page?.results || []) || [];

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = useCallback(
    (id: number, type: MediaType) => {
      navigation.push("Detail", { id, mediaType: type });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Movie | TVShow }) => {
      if (!item) return null; // Safety check
      const itemType = isMovie(item) ? "movie" : "tv";
      const itemTitle = isMovie(item) ? item.title : item.name;
      const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;

      return (
        <View style={styles.cardWrapper}>
          <MediaCard
            id={item.id}
            title={itemTitle}
            posterPath={item.poster_path}
            voteAverage={item.vote_average}
            releaseDate={releaseDate}
            mediaType={itemType}
            onPress={() => handleItemPress(item.id, itemType)}
            size="small"
          />
        </View>
      );
    },
    [handleItemPress],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={allItems}
        keyExtractor={(item, index) => `${item?.id || index}`}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator style={{ margin: 20 }} color={theme.primary} /> : null
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  footer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
});
