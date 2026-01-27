import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { SearchBar } from "@/components/SearchBar";
import { MediaCard } from "@/components/MediaCard";
import { TabSwitch } from "@/components/FilterChips";
import { MediaCardSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Movie, TVShow, MediaType } from "@/types/tmdb";
import { isMovie, debounce } from "@/utils/helpers";
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
} from "@/services/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query);
    }, 400),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      await addToSearchHistory(searchQuery.trim());
      await loadSearchHistory();
    }
  };

  const handleHistoryItemPress = (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
  };

  const handleRemoveHistoryItem = async (query: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await removeFromSearchHistory(query);
    await loadSearchHistory();
  };

  const handleClearHistory = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await clearSearchHistory();
    await loadSearchHistory();
  };

  const searchEndpoint = selectedTab === 0
    ? "/api/tmdb/search/movie"
    : selectedTab === 1
    ? "/api/tmdb/search/tv"
    : "/api/tmdb/search/multi";

  const { data: searchResults, isLoading } = useQuery<{
    results: (Movie | TVShow)[];
  }>({
    queryKey: [searchEndpoint, { query: debouncedQuery }],
    enabled: debouncedQuery.length > 0,
  });

  const handleItemPress = useCallback(
    (id: number, mediaType: MediaType) => {
      navigation.navigate("Detail", { id, mediaType });
    },
    [navigation]
  );

  const getMediaType = (item: Movie | TVShow): MediaType => {
    if (selectedTab === 0) return "movie";
    if (selectedTab === 1) return "tv";
    return isMovie(item) ? "movie" : "tv";
  };

  const renderItem = useCallback(
    ({ item }: { item: Movie | TVShow }) => {
      const title = isMovie(item) ? item.title : item.name;
      const releaseDate = isMovie(item)
        ? item.release_date
        : item.first_air_date;
      const mediaType = getMediaType(item);

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
    [selectedTab, handleItemPress]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.cardWrapper}>
              <MediaCardSkeleton />
            </View>
          ))}
        </View>
      );
    }

    if (debouncedQuery.length > 0) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-search.png")}
          title="No Results"
          message={`We couldn't find anything for "${debouncedQuery}". Try a different search.`}
        />
      );
    }

    return null;
  }, [isLoading, debouncedQuery]);

  const renderSearchHistory = () => (
    <View style={styles.historyContainer}>
      {searchHistory.length > 0 ? (
        <>
          <View style={styles.historyHeader}>
            <ThemedText style={styles.historyTitle}>Recent Searches</ThemedText>
            <Pressable
              onPress={handleClearHistory}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <ThemedText style={[styles.clearText, { color: theme.primary }]}>
                Clear All
              </ThemedText>
            </Pressable>
          </View>
          {searchHistory.map((query) => (
            <Pressable
              key={query}
              onPress={() => handleHistoryItemPress(query)}
              style={({ pressed }) => [
                styles.historyItem,
                {
                  backgroundColor: pressed
                    ? theme.backgroundSecondary
                    : "transparent",
                },
              ]}
            >
              <Feather
                name="clock"
                size={16}
                color={theme.textSecondary}
                style={styles.historyIcon}
              />
              <ThemedText style={styles.historyText} numberOfLines={1}>
                {query}
              </ThemedText>
              <Pressable
                onPress={() => handleRemoveHistoryItem(query)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={16} color={theme.textSecondary} />
              </Pressable>
            </Pressable>
          ))}
        </>
      ) : (
        <EmptyState
          image={require("../../assets/images/empty-search.png")}
          title="Search Movies & Shows"
          message="Find your favorite movies and TV shows by searching above."
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.searchContainer, { paddingTop: insets.top + Spacing.md }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmit={handleSearchSubmit}
          onClear={() => setDebouncedQuery("")}
          autoFocus={false}
        />
        <View style={styles.tabContainer}>
          <TabSwitch
            tabs={["Movies", "TV Shows", "All"]}
            selectedIndex={selectedTab}
            onSelectTab={setSelectedTab}
          />
        </View>
      </View>

      {debouncedQuery.length === 0 ? (
        renderSearchHistory()
      ) : (
        <FlatList
          data={searchResults?.results || []}
          keyExtractor={(item) => `search-${item.id}`}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + Spacing.xl },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingBottom: Spacing.md,
  },
  tabContainer: {
    marginTop: Spacing.md,
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
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  clearText: {
    fontSize: 14,
    fontWeight: "500",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  historyIcon: {
    marginRight: Spacing.md,
  },
  historyText: {
    flex: 1,
    fontSize: 15,
  },
});
