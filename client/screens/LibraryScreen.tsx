import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { MediaCard } from "@/components/MediaCard";
import { TabSwitch } from "@/components/FilterChips";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { HorizontalList } from "@/components/HorizontalList";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  WatchlistItem,
  FavoriteItem,
  WatchHistoryItem,
  MediaType,
} from "@/types/tmdb";
import {
  getWatchlist,
  getFavorites,
  getWatchHistory,
} from "@/services/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [selectedTab, setSelectedTab] = useState(0);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [watchlistData, favoritesData, historyData] = await Promise.all([
      getWatchlist(),
      getFavorites(),
      getWatchHistory(),
    ]);
    setWatchlist(watchlistData);
    setFavorites(favoritesData);
    setHistory(historyData);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleItemPress = useCallback(
    (id: number, mediaType: MediaType) => {
      navigation.navigate("Detail", { id, mediaType });
    },
    [navigation]
  );

  const currentData =
    selectedTab === 0 ? watchlist : selectedTab === 1 ? favorites : history;

  const renderItem = useCallback(
    ({ item }: { item: WatchlistItem | FavoriteItem | WatchHistoryItem }) => (
      <View style={styles.cardWrapper}>
        <MediaCard
          id={item.id}
          title={item.title}
          posterPath={item.posterPath}
          voteAverage={item.voteAverage}
          releaseDate={item.releaseDate}
          mediaType={item.mediaType}
          onPress={() => handleItemPress(item.id, item.mediaType)}
          size="large"
        />
      </View>
    ),
    [handleItemPress]
  );

  const renderEmpty = useCallback(() => {
    const emptyStates = [
      {
        image: require("../../assets/images/empty-library.png"),
        title: "Your Watchlist is Empty",
        message:
          "Start adding movies and shows to your watchlist to keep track of what you want to watch.",
      },
      {
        image: require("../../assets/images/empty-library.png"),
        title: "No Favorites Yet",
        message:
          "Mark your favorite movies and shows to easily find them here.",
      },
      {
        image: require("../../assets/images/empty-library.png"),
        title: "No Watch History",
        message: "Movies and shows you view will appear here.",
      },
    ];

    const { image, title, message } = emptyStates[selectedTab];

    return <EmptyState image={image} title={title} message={message} />;
  }, [selectedTab]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.tabContainer,
          { paddingTop: headerHeight + Spacing.md },
        ]}
      >
        <TabSwitch
          tabs={["Watchlist", "Favorites", "History"]}
          selectedIndex={selectedTab}
          onSelectTab={setSelectedTab}
        />
      </View>

      <FlatList
        data={currentData}
        keyExtractor={(item) => `${item.mediaType}-${item.id}`}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
          currentData.length === 0 && styles.emptyContent,
        ]}
        columnWrapperStyle={
          currentData.length > 0 ? styles.columnWrapper : undefined
        }
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    paddingBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emptyContent: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
});
