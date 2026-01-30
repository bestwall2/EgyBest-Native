import React, { useCallback } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { NavHeader } from "@/components/NavHeader";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HorizontalList } from "@/components/HorizontalList";
import { SectionSkeleton, HeroSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Movie, TVShow, MediaType, TMDBResponse } from "@/types/tmdb";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const {
    data: trendingAll,
    isLoading: loadingTrendingAll,
    isError,
    error,
    refetch: refetchTrending,
  } = useQuery<TMDBResponse<Movie | TVShow>>({
    queryKey: ["/api/tmdb/trending/all/week"],
  });

  const { data: trendingMovies, isLoading: loadingTrending } = useQuery<
    TMDBResponse<Movie>
  >({
    queryKey: ["/api/tmdb/trending/movie/day"],
  });

  const { data: popularMovies, isLoading: loadingPopular } = useQuery<
    TMDBResponse<Movie>
  >({
    queryKey: ["/api/tmdb/movie/popular"],
  });

  const { data: topRatedMovies, isLoading: loadingTopRated } = useQuery<
    TMDBResponse<Movie>
  >({
    queryKey: ["/api/tmdb/movie/top_rated"],
  });

  const { data: trendingTV, isLoading: loadingTrendingTV } = useQuery<
    TMDBResponse<TVShow>
  >({
    queryKey: ["/api/tmdb/trending/tv/day"],
  });

  const { data: popularTV, isLoading: loadingPopularTV } = useQuery<
    TMDBResponse<TVShow>
  >({
    queryKey: ["/api/tmdb/tv/popular"],
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const handleItemPress = useCallback(
    (id: number, mediaType: MediaType) => {
      navigation.navigate("Detail", { id, mediaType });
    },
    [navigation],
  );

  const handlePlay = useCallback(
    (id: number, mediaType: MediaType) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("Detail", { id, mediaType });
    },
    [navigation],
  );

  const handleInfo = useCallback(
    (id: number, mediaType: MediaType) => {
      navigation.navigate("Detail", { id, mediaType });
    },
    [navigation],
  );

  const handleSearchPress = useCallback(() => {
    navigation.getParent()?.navigate("SearchTab");
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate("Settings");
  }, [navigation]);

  const handleExploreAll = useCallback(() => {
    navigation.navigate("BrowseTab" as any);
  }, [navigation]);

  const heroData = trendingAll?.results?.slice(0, 5) || [];

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries();
    refetchTrending();
  }, [queryClient, refetchTrending]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <NavHeader
        scrollY={scrollY}
        onSearchPress={handleSearchPress}
        onSettingsPress={handleSettingsPress}
      />

      {isError && !loadingTrendingAll ? (
        <View style={styles.errorContainer}>
          <EmptyState
            image={require("../../assets/images/icon.png")}
            title={t("unable_load")}
            message={(error as any)?.message || t("error_message")}
            actionLabel={t("try_again")}
            onAction={handleRetry}
          />
        </View>
      ) : (
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingBottom: tabBarHeight + Spacing.xl,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              progressViewOffset={insets.top + 56}
            />
          }
        >
          {loadingTrendingAll ? (
            <HeroSkeleton />
          ) : heroData.length > 0 ? (
            <HeroCarousel
              data={heroData}
              onPlay={handlePlay}
              onInfo={handleInfo}
            />
          ) : null}

          <View style={styles.sectionsContainer}>
            {loadingTrending ? (
              <SectionSkeleton />
            ) : (
              <HorizontalList
                title={t("trending_movies")}
                data={trendingMovies?.results?.slice(0, 10) || []}
                mediaType="movie"
                isLoading={loadingTrending}
                onItemPress={handleItemPress}
                showSeeAll
                onSeeAllPress={handleExploreAll}
              />
            )}

            {loadingPopular ? (
              <SectionSkeleton />
            ) : (
              <HorizontalList
                title={t("popular_movies")}
                data={popularMovies?.results?.slice(0, 10) || []}
                mediaType="movie"
                isLoading={loadingPopular}
                onItemPress={handleItemPress}
                showSeeAll
                onSeeAllPress={handleExploreAll}
              />
            )}

            {loadingTopRated ? (
              <SectionSkeleton />
            ) : (
              <HorizontalList
                title={t("top_rated")}
                data={topRatedMovies?.results?.slice(0, 10) || []}
                mediaType="movie"
                isLoading={loadingTopRated}
                onItemPress={handleItemPress}
                showSeeAll
                onSeeAllPress={handleExploreAll}
              />
            )}

            {loadingTrendingTV ? (
              <SectionSkeleton />
            ) : (
              <HorizontalList
                title={t("trending_tv")}
                data={trendingTV?.results?.slice(0, 10) || []}
                mediaType="tv"
                isLoading={loadingTrendingTV}
                onItemPress={handleItemPress}
                showSeeAll
                onSeeAllPress={handleExploreAll}
              />
            )}

            {loadingPopularTV ? (
              <SectionSkeleton />
            ) : (
              <HorizontalList
                title={t("popular_tv")}
                data={popularTV?.results?.slice(0, 10) || []}
                mediaType="tv"
                isLoading={loadingPopularTV}
                onItemPress={handleItemPress}
                showSeeAll
                onSeeAllPress={handleExploreAll}
              />
            )}
          </View>
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionsContainer: {
    marginTop: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});
