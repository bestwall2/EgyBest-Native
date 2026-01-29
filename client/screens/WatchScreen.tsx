import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
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
import Animated, { FadeInUp } from "react-native-reanimated";
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { TVShowDetails, SeasonDetails, Episode } from "@/types/tmdb";
import { getImageUrl, slugify } from "@/utils/helpers";
import { VideoLinksModal } from "@/components/VideoLinksModal";
import { getTVShowDetails, getTVSeasonDetails } from "@/services/tmdb";


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WatchRouteProp = RouteProp<RootStackParamList, "Watch">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);
const serverLinks: Record<
  string,
  (id: string, s: string, e: string, type: string, title: string) => string
> = {
  server1: (id, s, e, type, title) =>
    type === "movie"
      ? `https://vidlink.pro/movie/${id}`
      : `https://vidlink.pro/tv/${id}/${s}/${e}`,
  server2: (id, s, e, type, title) =>
    type === "movie"
      ? `https://vidsrcme.ru/embed/movie?tmdb=${id}`
      : `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  server3: (id, s, e, type, title) =>
    type === "movie"
      ? `https://vidsrc.cc/v2/embed/movie/${id}`
      : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  server4: (id, s, e, type, title) =>
    type === "movie"
      ? `https://player.videasy.net/movie/${id}`
      : `https://player.videasy.net/tv/${id}/${s}/${e}`,
  server5: (id, s, e, type, title) =>
    type === "movie"
      ? `https://111movies.com/movie/${id}`
      : `https://111movies.com/tv/${id}/${s}/${e}`,
  server6: (id, s, e, type, title) =>
    type === "movie"
      ? `https://godriveplayer.com/player.php?tmdb=${id}`
      : `https://godriveplayer.com/player.php?type=series&tmdb=${id}&season=${s}&episode=${e}`,
  server7: (id, s, e, type, title) => {
    const slug = slugify(title);
    if (type === "movie") {
      return `https://legacy.aether.mom/media/tmdb-movie-${id}-${slug}`;
    }
    // s and e should be TMDB season id and episode id for server7
    return `https://legacy.aether.mom/media/tmdb-tv-${id}-${slug}/${s}/${e}`;
  },
  server8: (id, s, e, type, title) =>
    type === "movie"
      ? `https://player.vidzee.wtf/embed/movie/${id}`
      : `https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}`,
  server9: (id, s, e, type, title) =>
    type === "movie"
      ? `https://www.nontongo.win/embed/movie/${id}`
      : `https://www.nontongo.win/embed/tv/${id}/${s}/${e}`,
  server10: (id, s, e, type, title) =>
    type === "movie"
      ? `https://vidfast.pro/movie/${id}`
      : `https://vidfast.pro/tv/${id}/${s}/${e}`,
  server11: (id, s, e, type, title) =>
    type === "movie"
      ? `https://netplayz.live/watch?type=movie&id=${id}`
      : `https://netplayz.live/watch?type=tv&id=${id}&s=${s}&e=${e}`,
  server12: (id, s, e, type, title) =>
    type === "movie"
      ? `https://mapple.uk/watch/movie/${id}`
      : `https://mapple.uk/watch/tv/${id}-${s}-${e}`,
};

const injectedJavaScript = `

  (function() {

    // Override window.open and window.alert to prevent popups

    window.open = () => null;

    window.alert = () => null;



    // XHR interception logic

    const open = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function() {

      this.addEventListener('load', function() {

        if (this.responseURL && window.ReactNativeWebView) {

          const url = this.responseURL;

          if (url.match(/\\.(m3u8|m3u|mp4|avi|mov|wmv|flv|webm|ogv|mkv)$/i) || url.includes('workers.dev')) {

            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIDEO_LINK', payload: url }));

          }

        }

      });

      open.apply(this, arguments);

    };



    // Listen for fetch requests (if any)

    const originalFetch = window.fetch;

    window.fetch = function(...args) {

      return originalFetch.apply(this, args).then(response => {

        if (response.url && window.ReactNativeWebView) {

          const url = response.url;

          if (url.match(/\\.(m3u8|m3u|mp4|avi|mov|wmv|flv|webm|ogv|mkv)$/i) || url.includes('workers.dev')) {

            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIDEO_LINK', payload: url }));

          }

        }

        return response;

      });

    };



   // Hide UI elements on legacy.aether.mom
    if (window.location.hostname === 'legacy.aether.mom') {
    
      const styleElement = document.createElement('style');
      styleElement.innerHTML = 'div.pointer-events-auto.absolute.top-0.w-full { display: none !important; visibility: hidden !important; height: 0 !important; pointer-events: none !important; }';
      document.head.appendChild(styleElement);

    
      // Aggressive JS removal (React safe)
      const aggressivelyHideElements = () => {
    
        // Top bar
        const bar = document.querySelector(
          'div.pointer-events-auto.absolute.top-0.w-full'
        );
        if (bar) bar.remove();
    
        // Back to home button
        const backBtn = document.querySelector(
          'a.tabbable.bg-buttons-cancel'
        );
        if (backBtn) backBtn.remove();
    
        // Fallback by text (extra safety)
        document.querySelectorAll('a').forEach(el => {
          if (el.innerText && el.innerText.toLowerCase().includes('back to home')) {
            el.remove();
          }
        });
      };
    
      // Run now
      aggressivelyHideElements();
    
      // Run continuously
      setInterval(aggressivelyHideElements, 200);
    
      // Watch React rerenders
      const observer = new MutationObserver(aggressivelyHideElements);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
    
  })();

  true;

`;

export default function WatchScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
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
  const [capturedLinks, setCapturedLinks] = useState<string[]>([]);
  const [isLinksModalVisible, setIsLinksModalVisible] = useState(false); // New state for modal visibility
  const webViewRef = useRef<WebView>(null);

 const { data: tvShowDetails } = useQuery<TVShowDetails>({
    queryKey: ["tvShowDetails", id],
    queryFn: () => getTVShowDetails(Number(id)),
    enabled: mediaType === "tv",
  });
  
  const { data: seasonDetails } = useQuery<SeasonDetails>({
    queryKey: ["seasonDetails", id, selectedSeason],
    queryFn: () => getTVSeasonDetails(Number(id), selectedSeason),
    enabled: mediaType === "tv" && !!tvShowDetails,
  });


  const currentEpisode = seasonDetails?.episodes?.find(
    (ep) => ep.episode_number === selectedEpisode,
  );

  const videoUrl = useMemo(() => {
  const tmdbId = id.toString();

  if (selectedServer === "server7" && mediaType === "tv") {
    // server7 uses internal season ID + episode ID
    const seasonId = seasonDetails?.id ?? selectedSeason;
    const episodeObj = seasonDetails?.episodes?.find(
      (ep) => ep.episode_number === selectedEpisode
    );
    const episodeId = episodeObj?.id ?? selectedEpisode;

    return serverLinks.server7(
      tmdbId,
      seasonId.toString(),
      episodeId.toString(),
      mediaType,
      title
    );
  }

  // For all other servers, pass only the numeric season/episode
  return serverLinks[selectedServer](
    tmdbId,
    selectedSeason.toString(),
    selectedEpisode.toString(),
    mediaType,
    title
  );
}, [selectedServer, id, selectedSeason, selectedEpisode, seasonDetails, mediaType, title]);


  // Extract currentVideoBaseUrlPath within useMemo to ensure videoUrl is available
  const currentVideoBaseUrlPath = useMemo(() => {
    if (typeof videoUrl !== 'string') return videoUrl; // Handle case where videoUrl might not be a string
    return videoUrl.includes('/media/') ? videoUrl.substring(0, videoUrl.indexOf('/media/') + 7) : videoUrl;
  }, [videoUrl]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'VIDEO_LINK' && message.payload) {
        setCapturedLinks((prevLinks) => {
          if (!prevLinks.includes(message.payload)) {
            return [...prevLinks, message.payload];
          }
          return prevLinks;
        });
      }
    } catch (error) {
      console.error("Failed to parse webview message:", error);
    }
  }, []);

  // Ensure selectedEpisode is valid when seasonDetails arrives
  useEffect(() => {
    if (seasonDetails?.episodes && seasonDetails.episodes.length > 0) {
      const maxEp = seasonDetails.episodes.length;
      if (selectedEpisode > maxEp) {
        setSelectedEpisode(1);
      }
    }
  }, [seasonDetails, selectedEpisode]);
      
  const handleEpisodePress = useCallback((episodeNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEpisode(episodeNumber);
    setIsLoading(true);
    setCapturedLinks([]); // Clear captured links on episode change
  }, []);

  const handleSeasonPress = useCallback((seasonNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
    setIsLoading(true);
    setCapturedLinks([]); // Clear captured links on season change
  }, []);

  const handleServerPress = useCallback((server: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedServer(server);
    setIsLoading(true);
    setCapturedLinks([]); // Clear captured links on server change
  }, []);

  useEffect(() => {
    console.log('seasonDetails debug', seasonDetails);
  }, [seasonDetails]);


  const renderEpisodeItem = useCallback(
    ({ item, index }: { item: Episode; index: number }) => {
      const isSelected = item.episode_number === selectedEpisode;
      const stillUrl = getImageUrl(item.still_path, "backdrop", "medium");

      return (
        <Animated.View key={item.id ?? item.episode_number ?? index} entering={FadeInUp.delay(index * 50)}>
          <Pressable
            onPress={() => handleEpisodePress(item.episode_number)}
            style={[
              styles.episodeGridCard,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: isSelected ? theme.primary : "transparent",
              },
            ]}
          >
            <View style={styles.episodeGridThumbnail}>
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
                  {t("episodes")} {item.episode_number}
                </ThemedText>
              </View>
              {isSelected && (
                <View
                  style={[
                    styles.playingBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <ThemedText style={styles.playingText}>
                    {t("now_playing")}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.episodeGridInfo}>
              <ThemedText style={styles.episodeGridTitle} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText
                style={[styles.episodeOverview, { color: theme.textSecondary }]}
                numberOfLines={3}
              >
                {item.overview || t("no_description")}
              </ThemedText>
              <View style={styles.episodeMeta}>
                {item.runtime ? (
                  <ThemedText
                    style={[
                      styles.episodeRuntime,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {item.runtime} min
                  </ThemedText>
                ) : null}
                {item.air_date ? (
                  <ThemedText
                    style={[
                      styles.episodeRuntime,
                      { color: theme.textSecondary },
                    ]}
                  >
                    • {new Date(item.air_date).getFullYear()}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      );
    },
    [selectedEpisode, theme, t, handleEpisodePress],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.videoContainer,
          { height: VIDEO_HEIGHT + insets.top, paddingTop: insets.top },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { top: insets.top + 10 },
            isRTL ? { right: Spacing.lg } : { left: Spacing.lg },
          ]}
        >
          <Feather
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        {/* Fullscreen button for all servers */}
        <Pressable
          onPress={() =>
            navigation.navigate("FullscreenWatch", { videoUrl: videoUrl })
          }
          style={[
            styles.fullscreenButton,
            { top: insets.top + 10 },
            isRTL ? { left: Spacing.lg } : { right: Spacing.lg }, // Position opposite to back button
          ]}
        >
          <Feather name="maximize" size={24} color="#FFFFFF" />
        </Pressable>

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
          onShouldStartLoadWithRequest={(event) => {
            const requestedUrl = event.url;
            if (typeof requestedUrl !== 'string') {
              return false;
            }

            const currentHost = new URL(videoUrl).hostname; // This is the host of the selected server
            let requestHost: string;
            try {
              requestHost = new URL(requestedUrl).hostname;
            } catch (e) {
              return false; // Invalid URL
            }

            // Always allow internal navigation (e.g., about:blank, about:srcdoc)
            if (requestedUrl.startsWith('about:')) {
              return true;
            }

            // Special handling for aether.mom and legacy.aether.mom
            if (requestHost === 'aether.mom' || requestHost === 'legacy.aether.mom') {
              // Block the root domains without /media/
              if (requestedUrl === 'https://aether.mom/' || requestedUrl === 'https://legacy.aether.mom/') {
                return false;
              }
              // Allow anything that contains /media/ under these domains
              if (requestedUrl.includes('aether.mom/media/')) { // This covers both aether.mom/media/ and legacy.aether.mom/media/
                return true;
              }
              // If it's aether.mom or legacy.aether.mom but not /media/, block it
              return false;
            }

            // For all other servers, allow navigation if the hostnames are the same as the initial video URL
            if (currentHost === requestHost) {
              return true;
            }

            // Block all other navigations
            return false;
          }}
          domStorageEnabled
          injectedJavaScript={injectedJavaScript}
          onMessage={handleWebViewMessage} // Add onMessage handler
          onLoadEnd={() => setIsLoading(false)}
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
              {t("seasons")} {selectedSeason}, {t("episodes")} {selectedEpisode}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.serversSection}>
          <ThemedText style={styles.sectionTitle}>
            {t("select_server")}
          </ThemedText>
          <View style={styles.gridRow}>
            {Object.keys(serverLinks).map((server, index) => (
              <Pressable
                key={server}
                onPress={() => handleServerPress(server)}
                style={[
                  styles.serverGridItem,
                  {
                    backgroundColor:
                      selectedServer === server
                        ? theme.primary
                        : theme.backgroundSecondary,
                    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 3) / 4,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.serverGridText,
                    {
                      color: selectedServer === server ? "#FFFFFF" : theme.text,
                    },
                  ]}
                >
                  #{index + 1}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {mediaType === "tv" ? (
          <>
            <View style={styles.seasonsSection}>
              <ThemedText style={styles.sectionTitle}>
                {t("seasons")}
              </ThemedText>
              <View style={styles.gridRow}>
                {Array.from(
                  { length: tvShowDetails?.number_of_seasons || selectedSeason },
                  (_, i) => i + 1,
                ).map((seasonNum) => (
                  <Pressable
                    key={seasonNum}
                    onPress={() => handleSeasonPress(seasonNum)}
                    style={[
                      styles.seasonGridItem,
                      {
                        backgroundColor:
                          selectedSeason === seasonNum
                            ? theme.primary
                            : theme.backgroundSecondary,
                        width:
                          (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 4) / 5,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.seasonGridText,
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
                ))}
              </View>
            </View>

            <View style={styles.episodesSection}>
              <ThemedText style={styles.sectionTitle}>
                {t("episodes")}{" "}
                {seasonDetails?.episodes?.length
                  ? `(${seasonDetails.episodes.length})`
                  : ""}
              </ThemedText>
             {seasonDetails ? (
                seasonDetails.episodes && seasonDetails.episodes.length > 0 ? (
                  <View style={styles.episodesGridList}>
                    {seasonDetails.episodes.map((item, index) =>
                      renderEpisodeItem({ item, index }),
                    )}
                  </View>
                ) : (
                  <ThemedText style={{ padding: Spacing.lg }}>
                    {t('no_episodes_found') ?? 'No episodes found'}
                  </ThemedText>
                )
              ) : (
                <View style={styles.episodesLoading}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              )}

            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsLinksModalVisible(true); // Open the modal
        }}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <Feather name="link" size={24} color="#FFFFFF" />
      </Pressable>
      <VideoLinksModal
        isVisible={isLinksModalVisible}
        links={capturedLinks}
        onClose={() => setIsLinksModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: "#000000",
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backButton: {
    position: "absolute",
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenButton: {
    position: "absolute",
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  serverGridItem: {
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  serverGridText: {
    fontSize: 14,
    fontWeight: "700",
  },
  seasonsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  seasonGridItem: {
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  seasonGridText: {
    fontSize: 13,
    fontWeight: "600",
  },
  episodesSection: {
    paddingHorizontal: Spacing.lg,
  },
  episodesGridList: {
    gap: Spacing.lg,
  },
  episodesLoading: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  episodeGridCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    height: 120,
  },
  episodeGridThumbnail: {
    width: 160,
    height: "100%",
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
  episodeGridInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: "space-between",
  },
  episodeGridTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  episodeOverview: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  episodeMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  episodeRuntime: {
    fontSize: 11,
  },
  playingBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: "center",
  },
  playingText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});


