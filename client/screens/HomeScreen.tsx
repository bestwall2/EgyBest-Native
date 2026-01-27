import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { HeroCard } from "@/components/MediaCard";
import { HorizontalList } from "@/components/HorizontalList";
import { HeroSkeleton, SectionSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingTVShows,
  getPopularTVShows,
} from "@/services/tmdb";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Movie, TVShow, MediaType } from "@/types/tmdb";
import { isMovie } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const { data: trendingMovies, isLoading: loadingTrending } = useQuery({
    queryKey: ["/api/tmdb/trending/movie/day"],
  });

  const { data: popularMovies, isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/tmdb/movie/popular"],
  });

  const { data: topRatedMovies, isLoading: loadingTopRated } = useQuery({
    queryKey: ["/api/tmdb/movie/top_rated"],
  });

  const { data: trendingTV, isLoading: loadingTrendingTV } = useQuery({
    queryKey: ["/api/tmdb/trending/tv/day"],
  });

  const { data: popularTV, isLoading: loadingPopularTV } = useQuery({
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
    [navigation]
  );

  const heroItem = trendingMovies?.results?.[0];
  const isLoading =
    loadingTrending ||
    loadingPopular ||
    loadingTopRated ||
    loadingTrendingTV ||
    loadingPopularTV;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    >
      {loadingTrending ? (
        <View style={styles.heroContainer}>
          <HeroSkeleton />
        </View>
      ) : heroItem ? (
        <View style={styles.heroContainer}>
          <HeroCard
            id={heroItem.id}
            title={heroItem.title}
            backdropPath={heroItem.backdrop_path}
            overview={heroItem.overview}
            voteAverage={heroItem.vote_average}
            mediaType="movie"
            onPress={() => handleItemPress(heroItem.id, "movie")}
          />
        </View>
      ) : null}

      {loadingTrending ? (
        <SectionSkeleton />
      ) : (
        <HorizontalList
          title="Trending Movies"
          data={trendingMovies?.results?.slice(1, 11) || []}
          mediaType="movie"
          isLoading={loadingTrending}
          onItemPress={handleItemPress}
        />
      )}

      {loadingPopular ? (
        <SectionSkeleton />
      ) : (
        <HorizontalList
          title="Popular Movies"
          data={popularMovies?.results?.slice(0, 10) || []}
          mediaType="movie"
          isLoading={loadingPopular}
          onItemPress={handleItemPress}
        />
      )}

      {loadingTopRated ? (
        <SectionSkeleton />
      ) : (
        <HorizontalList
          title="Top Rated"
          data={topRatedMovies?.results?.slice(0, 10) || []}
          mediaType="movie"
          isLoading={loadingTopRated}
          onItemPress={handleItemPress}
        />
      )}

      {loadingTrendingTV ? (
        <SectionSkeleton />
      ) : (
        <HorizontalList
          title="Trending TV Shows"
          data={trendingTV?.results?.slice(0, 10) || []}
          mediaType="tv"
          isLoading={loadingTrendingTV}
          onItemPress={handleItemPress}
        />
      )}

      {loadingPopularTV ? (
        <SectionSkeleton />
      ) : (
        <HorizontalList
          title="Popular TV Shows"
          data={popularTV?.results?.slice(0, 10) || []}
          mediaType="tv"
          isLoading={loadingPopularTV}
          onItemPress={handleItemPress}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    paddingHorizontal: Spacing.lg,
  },
});
