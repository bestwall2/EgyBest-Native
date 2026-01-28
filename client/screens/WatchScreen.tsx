import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { SeasonDetails, Episode } from "@/types/tmdb";
import { getImageUrl } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WatchRouteProp = RouteProp<RootStackParamList, "Watch">;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

const serverLinks: Record<
  string,
  (id: string, s: string, e: string, type: string) => string
> = {
  server1: (id, s, e, type) =>
    type === "movie"
      ? `https://vidlink.pro/movie/${id}`
      : `https://vidlink.pro/tv/${id}/${s}/${e}`,
  server2: (id, s, e, type) =>
    type === "movie"
      ? `https://vidsrcme.ru/embed/movie?tmdb=${id}`
      : `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  server3: (id, s, e, type) =>
    type === "movie"
      ? `https://vidsrc.cc/v2/embed/movie/${id}`
      : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  server4: (id, s, e, type) =>
    type === "movie"
      ? `https://player.videasy.net/movie/${id}`
      : `https://player.videasy.net/tv/${id}/${s}/${e}`,
  server5: (id, s, e, type) =>
    type === "movie"
      ? `https://111movies.com/movie/${id}`
      : `https://111movies.com/tv/${id}/${s}/${e}`,
  server6: (id, s, e, type) =>
    type === "movie"
      ? `https://godriveplayer.com/player.php?tmdb=${id}`
      : `https://godriveplayer.com/player.php?type=series&tmdb=${id}&season=${s}&episode=${e}`,
  server7: (id, s, e, type) =>
    type === "movie"
      ? `https://vidsrc.cx/embed/movie/${id}`
      : `https://vidsrc.cx/embed/tv/${id}/${s}/${e}`,
  server8: (id, s, e, type) =>
    type === "movie"
      ? `https://player.vidzee.wtf/embed/movie/${id}`
      : `https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}`,
};

const adBlockScript = `
  (function() {
    const blockAds = () => {
      const selectors = [
        '[class*="ad"]', '[id*="ad"]', '[class*="popup"]', '[id*="popup"]',
        '[class*="banner"]', '[class*="overlay"]', 'iframe[src*="ads"]',
        '[onclick*="window.open"]', '[target="_blank"]'
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (!el.closest('video') && !el.querySelector('video')) {
            el.style.display = 'none';
          }
        });
      });
    };
    window.open = () => null;
    window.alert = () => null;
    setInterval(blockAds, 1000);
    blockAds();
  })();
  true;
`;

export default function WatchScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WatchRouteProp>();
  const {
    id,
    mediaType,
    title,
    season: initialSeason = 1,
    episode: initialEpisode = 1,
  } = route.params;

  const [selectedServer, setSelectedServer] = useState("server1");
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const { data: seasonDetails } = useQuery<SeasonDetails>({
    queryKey: [`/api/tmdb/tv/${id}/season/${selectedSeason}`],
    enabled: mediaType === "tv",
  });

  const videoUrl = serverLinks[selectedServer](
    id.toString(),
    selectedSeason.toString(),
    selectedEpisode.toString(),
    mediaType,
  );

  const handleEpisodePress = useCallback((episodeNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEpisode(episodeNumber);
    setIsLoading(true);
  }, []);

  const handleSeasonPress = useCallback((seasonNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
  }, []);

  const handleServerPress = useCallback((server: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedServer(server);
    setIsLoading(true);
  }, []);

  const renderEpisodeItem = useCallback(
    ({ item }: { item: Episode }) => {
      const isSelected = item.episode_number === selectedEpisode;
      const stillUrl = getImageUrl(item.still_path, "backdrop", "small");

      return (
        <Animated.View entering={FadeInRight.delay(item.episode_number * 50)}>
          <Pressable
            onPress={() => handleEpisodePress(item.episode_number)}
            style={[
              styles.episodeCard,
              {
                backgroundColor: isSelected
                  ? theme.primary
                  : theme.backgroundSecondary,
                borderColor: isSelected ? theme.primary : "transparent",
              },
            ]}
          >
            <View style={styles.episodeThumbnail}>
              {stillUrl ? (
                <Image
                  source={{ uri: stillUrl }}
                  style={styles.episodeImage}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.episodeImage,
                    { backgroundColor: theme.backgroundRoot },
                  ]}
                >
                  <Feather name="play" size={24} color={theme.textSecondary} />
                </View>
              )}
              <View style={styles.episodeNumberBadge}>
                <ThemedText style={styles.episodeNumberText}>
                  E{item.episode_number}
                </ThemedText>
              </View>
            </View>
            <View style={styles.episodeInfo}>
              <ThemedText
                style={[
                  styles.episodeTitle,
                  { color: isSelected ? "#FFFFFF" : theme.text },
                ]}
                numberOfLines={2}
              >
                {item.name}
              </ThemedText>
              {item.runtime ? (
                <ThemedText
                  style={[
                    styles.episodeRuntime,
                    {
                      color: isSelected
                        ? "rgba(255,255,255,0.7)"
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {item.runtime} min
                </ThemedText>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      );
    },
    [selectedEpisode, theme, handleEpisodePress],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.videoContainer, { marginTop: insets.top }]}>
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : null}
        <WebView
          ref={webViewRef}
          source={{ uri: videoUrl }}
          style={styles.webView}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          injectedJavaScript={adBlockScript}
          onLoadEnd={() => setIsLoading(false)}
          onShouldStartLoadWithRequest={(request) => {
            if (
              request.url !== videoUrl &&
              !request.url.includes(videoUrl.split("/")[2])
            ) {
              return false;
            }
            return true;
          }}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        <View style={styles.titleSection}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          {mediaType === "tv" ? (
            <ThemedText
              style={[styles.episodeLabel, { color: theme.textSecondary }]}
            >
              Season {selectedSeason}, Episode {selectedEpisode}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.serversSection}>
          <ThemedText style={styles.sectionTitle}>Servers</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serversList}
          >
            {Object.keys(serverLinks).map((server, index) => (
              <Pressable
                key={server}
                onPress={() => handleServerPress(server)}
                style={[
                  styles.serverChip,
                  {
                    backgroundColor:
                      selectedServer === server
                        ? theme.primary
                        : theme.backgroundSecondary,
                  },
                ]}
              >
                <Feather
                  name="server"
                  size={14}
                  color={selectedServer === server ? "#FFFFFF" : theme.text}
                />
                <ThemedText
                  style={[
                    styles.serverText,
                    {
                      color: selectedServer === server ? "#FFFFFF" : theme.text,
                    },
                  ]}
                >
                  Server {index + 1}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {mediaType === "tv" ? (
          <>
            <View style={styles.seasonsSection}>
              <ThemedText style={styles.sectionTitle}>Seasons</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.seasonsList}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(
                  (seasonNum) => (
                    <Pressable
                      key={seasonNum}
                      onPress={() => handleSeasonPress(seasonNum)}
                      style={[
                        styles.seasonChip,
                        {
                          backgroundColor:
                            selectedSeason === seasonNum
                              ? theme.primary
                              : theme.backgroundSecondary,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.seasonText,
                          {
                            color:
                              selectedSeason === seasonNum
                                ? "#FFFFFF"
                                : theme.text,
                          },
                        ]}
                      >
                        S{seasonNum}
                      </ThemedText>
                    </Pressable>
                  ),
                )}
              </ScrollView>
            </View>

            <View style={styles.episodesSection}>
              <ThemedText style={styles.sectionTitle}>
                Episodes{" "}
                {seasonDetails?.episodes?.length
                  ? `(${seasonDetails.episodes.length})`
                  : ""}
              </ThemedText>
              {seasonDetails?.episodes ? (
                <FlatList
                  data={seasonDetails.episodes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderEpisodeItem}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.episodesList}
                />
              ) : (
                <ActivityIndicator color={theme.primary} />
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: "#000000",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  episodeLabel: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  serversSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  serversList: {
    gap: Spacing.sm,
  },
  serverChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  serverText: {
    fontSize: 13,
    fontWeight: "500",
  },
  seasonsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  seasonsList: {
    gap: Spacing.sm,
  },
  seasonChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  seasonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  episodesSection: {
    paddingHorizontal: Spacing.lg,
  },
  episodesList: {
    gap: Spacing.md,
  },
  episodeCard: {
    width: 200,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 2,
  },
  episodeThumbnail: {
    height: 110,
    position: "relative",
  },
  episodeImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  episodeNumberBadge: {
    position: "absolute",
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  episodeNumberText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  episodeInfo: {
    padding: Spacing.sm,
  },
  episodeTitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  episodeRuntime: {
    fontSize: 11,
    marginTop: 2,
  },
});
