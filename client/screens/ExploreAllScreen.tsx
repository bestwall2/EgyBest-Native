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
import { ThemedText } from "@/components/ThemedText";
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
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExploreAllRouteProp>();
  const { title, endpoint, mediaType } = route.params;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<{
    results: (Movie | TVShow)[];
    page: number;
    total_pages: number;
  }>({
    queryKey: [endpoint],
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages && lastPage.page < 500) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

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

  const allItems = data?.pages.flatMap((page) => page.results) || [];

  const renderItem = useCallback(
    ({ item }: { item: Movie | TVShow }) => {
      const itemTitle = isMovie(item) ? item.title : item.name;
      const releaseDate = isMovie(item)
        ? item.release_date
        : item.first_air_date;

      return (
        <View style={styles.cardWrapper}>
          <MediaCard
            id={item.id}
            title={itemTitle}
            posterPath={item.poster_path}
            voteAverage={item.vote_average}
            releaseDate={releaseDate}
            mediaType={mediaType}
            onPress={() => handleItemPress(item.id, mediaType)}
            size="small"
          />
        </View>
      );
    },
    [mediaType, handleItemPress],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }, [isFetchingNextPage, theme.primary]);

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather
          name={isRTL ? "arrow-right" : "arrow-left"}
          size={24}
          color={theme.text}
        />
      </Pressable>
      <ThemedText style={styles.headerTitle}>{title}</ThemedText>
    </View>
  );

  if (isLoading && allItems.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        {renderHeader()}
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={styles.cardWrapper}>
              <MediaCardSkeleton size="small" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {renderHeader()}
      <FlatList
        data={allItems}
        keyExtractor={(item, index) => `${mediaType}-${item.id}-${index}`}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
