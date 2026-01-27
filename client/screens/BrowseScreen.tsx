import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import { MediaCard } from "@/components/MediaCard";
import { FilterChips, TabSwitch } from "@/components/FilterChips";
import { MediaCardSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Movie, TVShow, MediaType, Genre } from "@/types/tmdb";
import { isMovie } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  const mediaType: MediaType = selectedTab === 0 ? "movie" : "tv";

  const { data: movieGenres } = useQuery<{ genres: Genre[] }>({
    queryKey: ["/api/tmdb/genre/movie/list"],
    enabled: selectedTab === 0,
  });

  const { data: tvGenres } = useQuery<{ genres: Genre[] }>({
    queryKey: ["/api/tmdb/genre/tv/list"],
    enabled: selectedTab === 1,
  });

  const genres = selectedTab === 0 ? movieGenres?.genres : tvGenres?.genres;

  const discoverEndpoint = selectedTab === 0 ? "/api/tmdb/discover/movie" : "/api/tmdb/discover/tv";
  const queryParams = selectedGenreId ? `?with_genres=${selectedGenreId}` : "";

  const {
    data: discoverData,
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
    queryKey: [discoverEndpoint + queryParams],
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
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
      navigation.navigate("Detail", { id, mediaType: type });
    },
    [navigation]
  );

  const handleTabChange = useCallback((index: number) => {
    setSelectedTab(index);
    setSelectedGenreId(null);
  }, []);

  const allItems = discoverData?.pages.flatMap((page) => page.results) || [];

  const renderItem = useCallback(
    ({ item }: { item: Movie | TVShow }) => {
      const title = isMovie(item) ? item.title : item.name;
      const releaseDate = isMovie(item)
        ? item.release_date
        : item.first_air_date;

      return (
        <View style={styles.cardWrapper}>
          <MediaCard
            id={item.id}
            title={title}
            posterPath={item.poster_path}
            voteAverage={item.vote_average}
            releaseDate={releaseDate}
            mediaType={mediaType}
            onPress={() => handleItemPress(item.id, mediaType)}
            size="large"
          />
        </View>
      );
    },
    [mediaType, handleItemPress]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }, [isFetchingNextPage, theme.primary]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.cardWrapper}>
              <MediaCardSkeleton />
            </View>
          ))}
        </View>
      );
    }
    return (
      <EmptyState
        image={require("../../assets/images/empty-browse.png")}
        title="No Results Found"
        message="Try adjusting your filters to find what you're looking for."
        actionLabel="Clear Filters"
        onAction={() => setSelectedGenreId(null)}
      />
    );
  }, [isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.filtersContainer,
          { paddingTop: headerHeight + Spacing.md },
        ]}
      >
        <TabSwitch
          tabs={["Movies", "TV Shows"]}
          selectedIndex={selectedTab}
          onSelectTab={handleTabChange}
        />
        {genres && genres.length > 0 ? (
          <FilterChips
            genres={genres}
            selectedGenreId={selectedGenreId}
            onSelectGenre={setSelectedGenreId}
          />
        ) : null}
      </View>

      <FlatList
        data={allItems}
        keyExtractor={(item) => `${mediaType}-${item.id}`}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        columnWrapperStyle={styles.columnWrapper}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
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
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    paddingBottom: Spacing.sm,
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
  },
});
