import React, { useState, useCallback } from "react";
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
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
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
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t } = useLanguage();
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
    }, []),
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
    [navigation],
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
    [handleItemPress],
  );

  const renderEmpty = useCallback(() => {
    const emptyStates = [
      {
        title: t("empty_watchlist_title"),
        message: t("empty_watchlist_msg"),
      },
      {
        title: t("empty_favorites_title"),
        message: t("empty_favorites_msg"),
      },
      {
        title: t("empty_history_title"),
        message: t("empty_history_msg"),
      },
    ];

    const { title, message } = emptyStates[selectedTab];

    return <EmptyState title={title} message={message} />;
  }, [selectedTab, t]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.tabContainer}>
        <TabSwitch
          tabs={[t("watchlist"), t("favorites"), t("history")]}
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
