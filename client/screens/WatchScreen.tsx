import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
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

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { TVShowDetails, SeasonDetails, Episode } from "@/types/tmdb";
import { getImageUrl, slugify } from "@/utils/helpers";
import { VideoLinksModal } from "@/components/VideoLinksModal";
import { getTVShowDetails, getTVSeasonDetails } from "@/services/tmdb";

// --- Custom hook to load servers dynamically ---
function useRemoteServers(rawUrl: string) {
  const [servers, setServers] = useState<Record<string, any> | null>(null);
  const [password, setPassword] = useState<string | number | null>(null);
  const [getCode, setGetCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch(rawUrl);
        const data = await res.json();

        // Convert array to object by server name
        const serversObj =
          data.servers?.reduce((acc: any, server: any) => {
            acc[server.name] = server;
            return acc;
          }, {}) || {};

        setServers(serversObj);
        setPassword(data.password ?? null);
        setGetCode(data.GETCODE ?? null);
      } catch (error) {
        console.error("Failed to fetch remote servers:", error);
        setServers(null);
        setPassword(null);
        setGetCode(null);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, [rawUrl]);

  const buildUrl = useCallback(
    (
      serverKey: string,
      mediaType: "movie" | "tv",
      id: string | number,
      season?: SeasonDetails | number,
      episode?: Episode | number,
      title?: string,
    ) => {
      if (!servers || !servers[serverKey]) return null;

      let template =
        mediaType === "movie"
          ? servers[serverKey].movie
          : servers[serverKey].tv;

      template = template.replace("{id}", id.toString());

      // server7 exception
      if (serverKey === "LEGEND" && mediaType === "tv" && episode && season) {
        template = template.replace("{season}", season.toString());
        template = template.replace(
          "{episode}",
          (episode as Episode).id.toString(),
        );
        if (title) template = template.replace("{title}", slugify(title));
      } else {
        if (season) template = template.replace("{season}", season.toString());
        if (episode)
          template = template.replace("{episode}", episode.toString());
        if (title) template = template.replace("{title}", slugify(title));
      }

      return template;
    },
    [servers],
  );

  return { servers, password, getCode, buildUrl, loading };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type WatchRouteProp = RouteProp<RootStackParamList, "Watch">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

// Function to extract hostname from URL
const getHostname = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return "";
  }
};

// Function to extract meaningful words from hostname
const extractHostnameWords = (hostname: string): string[] => {
  // Remove common TLDs and split by separators
  const withoutTLD = hostname.replace(
    /\.(com|net|org|io|ru|tv|me|to|co|app|dev|cc|xyz|live|stream|watch|video|site|online|pro|info|biz)$/i,
    "",
  );

  // Split by dots, hyphens, and underscores
  const parts = withoutTLD.split(/[.\-_]/);

  // Filter out very short parts (less than 3 chars) and numbers-only
  const words = parts
    .filter((part) => part.length >= 3 && !/^\d+$/.test(part))
    .map((w) => w.toLowerCase());

  return words;
};

// Function to check if two hostnames are related
const areHostnamesRelated = (hostname1: string, hostname2: string): boolean => {
  if (hostname1 === hostname2) return true;

  const words1 = extractHostnameWords(hostname1);
  const words2 = extractHostnameWords(hostname2);

  // Check if they share at least one significant word
  const commonWords = words1.filter((word) => words2.includes(word));

  // If they share any common word, they're related
  if (commonWords.length > 0) {
    return true;
  }

  // Check for partial matches (e.g., "vidsrc" in both "vidsrcme" and "vidsrc-embed")
  for (const word1 of words1) {
    for (const word2 of words2) {
      // Check if one contains the other (minimum 4 chars to avoid false positives)
      if (word1.length >= 4 && word2.length >= 4) {
        if (word1.includes(word2) || word2.includes(word1)) {
          return true;
        }
      }
    }
  }

  return false;
};

// Check if URL is a media file
const isMediaFile = (url: string): boolean => {
  const mediaExtensions = [
    ".mp4",
    ".ts",
    ".webm",
    ".ogg",
    ".m3u8",
    ".mpd",
    ".m4v",
    ".mov",
    ".avi",
    ".mkv",
    ".flv",
    ".wmv",
    ".m4a",
    ".mp3",
    ".wav",
    ".ts",
    ".m2ts",
    ".3gp",
    ".3g2",
  ];
  const lowerUrl = url.toLowerCase();
  return mediaExtensions.some((ext) => lowerUrl.includes(ext));
};

// Check if URL is a subtitle file
const isSubtitleFile = (url: string): boolean => {
  const subtitleExtensions = [
    ".vtt",
    ".srt",
    ".ass",
    ".ssa",
    ".sub",
    ".sbv",
    ".ttml",
  ];
  const lowerUrl = url.toLowerCase();
  return subtitleExtensions.some((ext) => lowerUrl.includes(ext));
};

// Check if URL contains worker
const hasWorkerInUrl = (url: string): boolean => {
  return url.toLowerCase().includes("worker");
};

// Check if URL is TMDB request
const isTMDBRequest = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes("themoviedb.org") ||
    lowerUrl.includes("tmdb.org") ||
    lowerUrl.includes("image.tmdb.org")
  );
};

// Check if URL is a proxy request (contains workers.dev with destination parameter)
const isProxyRequest = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes("workers.dev") && lowerUrl.includes("destination=");
};

const injectedJavaScript = `
(function() {


   
  // prevent popups
  window.open = () => null;
  window.alert = () => null;

  // ==========================
  // Remove only navbar + back button
  // ==========================

  const hideNavbarElements = () => {
    try {

      // Remove top site header (navbar)
      document.querySelectorAll('div').forEach(el => {
        const cls = el.className || '';
        if (
          typeof cls === 'string' &&
          cls.includes('pointer-events-auto') &&
          cls.includes('top-0') &&
          el.children.length > 0
        ) {
          // Don't touch video containers
          if (!el.querySelector('video')) {
            el.remove();
          }
        }
      });

      // Remove back-to-home button
      document.querySelectorAll(".popout-wrapper").forEach(el => el.remove());
      document.querySelectorAll('a').forEach(a => {
        const text = (a.innerText || '').toLowerCase();
        const cls = a.className || '';

        if (
          text.includes('back to home') ||
          cls.includes('bg-buttons-cancel') ||
          cls.includes('tabbable')
        ) {
          a.remove();
        }
      });

    } catch(e) {}
  };

  // Run once + observe
  hideNavbarElements();

  const observer = new MutationObserver(hideNavbarElements);
  observer.observe(
    document.body || document.documentElement,
    { childList: true, subtree: true }
  );

  setInterval(hideNavbarElements, 300);
 const block = (fnName) => {
    const original = window.location[fnName];
    window.location[fnName] = function(url) {
      console.log("🚫 Redirect blocked:", url);
      return null;
    };
  };

  block("assign");
  block("replace");

  // Block direct href changes
  let lastHref = location.href;
  Object.defineProperty(window.location, "href", {
    set: function(url) {
      console.log("🚫 Redirect blocked:", url);
      return lastHref;
    },
    get: function() {
      return lastHref;
    }
  });

setInterval(() => {
  document.querySelectorAll("iframe").forEach(frame => {

    const r = frame.getBoundingClientRect();

    if (
      r.width > window.innerWidth * 0.3 &&
      r.height > window.innerHeight * 0.3 &&
      getComputedStyle(frame).position === "fixed"
    ) {
      frame.remove();
    }
  });
}, 500);

  
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

  const [selectedServer, setSelectedServer] = useState("FAST");
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedLinks, setCapturedLinks] = useState<string[]>([]);
  const [isLinksModalVisible, setIsLinksModalVisible] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // --- Load servers from remote JSON ---
  const { servers, buildUrl } = useRemoteServers(
    "https://raw.githubusercontent.com/bestwall2/EgyBest-Native/refs/heads/main/data.json",
  );

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

  const videoUrl = useMemo(() => {
    if (!servers) return "";

    const episodeObj = seasonDetails?.episodes?.find(
      (ep) => ep.episode_number === selectedEpisode,
    );

    let seasonParam: number | undefined = selectedSeason;

    // If LEGEND, pass the real season ID from TMDB instead of just the season number
    if (selectedServer === "LEGEND" && seasonDetails) {
      seasonParam = seasonDetails.id; // <-- important for LEGEND
    }

    return (
      buildUrl(
        selectedServer,
        mediaType,
        id,
        seasonParam,
        selectedServer === "LEGEND" ? episodeObj : selectedEpisode,
        title,
      ) || ""
    );
  }, [
    servers,
    selectedServer,
    mediaType,
    id,
    selectedSeason,
    selectedEpisode,
    title,
    seasonDetails,
    buildUrl,
  ]);

  // Extract hostname from video URL
  const allowedHostname = useMemo(() => {
    return getHostname(videoUrl);
  }, [videoUrl]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "VIDEO_LINK" && message.payload) {
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
    setCapturedLinks([]);
  }, []);

  const pauseMedia = () => {
    webViewRef.current?.injectJavaScript(`
    (function() {
      document.querySelectorAll('video, audio').forEach(m => {
        m.pause();
      });
    })();
    true;
  `);
  };

  const handleSeasonPress = useCallback((seasonNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
    setIsLoading(true);
    setCapturedLinks([]);
  }, []);

  const handleServerPress = useCallback((server: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedServer(server);
    setIsLoading(true);
    setCapturedLinks([]);
  }, []);

  useEffect(() => {
    console.log("Video URL:", videoUrl);
    console.log("Allowed hostname:", allowedHostname);
    console.log("Hostname words:", extractHostnameWords(allowedHostname));
  }, [videoUrl, allowedHostname]);

  // Enhanced hostname-based navigation blocking with media/worker/TMDB/subtitle support
  const handleShouldStartLoadWithRequest = useCallback(
    (request: any) => {
      const requestHostname = getHostname(request.url);

      console.log("Navigation request to:", requestHostname);

      // Check if this is aether server
      const isAether = allowedHostname.includes("aether");

      // Allow proxy requests
      if (isProxyRequest(request.url)) {
        console.log("✅ Allowed proxy request:", request.url);
        return true;
      }

      // Aether exception: allow same-hostname navigation
      if (isAether && requestHostname === allowedHostname) {
        console.log(
          "✅ Aether: Allowed same-hostname navigation:",
          requestHostname,
        );
        return true;
      }

      // Allow media files
      if (isMediaFile(request.url)) {
        console.log("✅ Allowed media file:", request.url);
        return true;
      }

      // Allow subtitle files
      if (isSubtitleFile(request.url)) {
        console.log("✅ Allowed subtitle file:", request.url);
        return true;
      }

      // Allow worker URLs
      if (hasWorkerInUrl(request.url)) {
        console.log("✅ Allowed worker URL:", request.url);
        return true;
      }

      // Allow TMDB requests
      if (isTMDBRequest(request.url)) {
        console.log("✅ Allowed TMDB request:", request.url);
        return true;
      }

      // Check if hostnames are related
      if (areHostnamesRelated(allowedHostname, requestHostname)) {
        console.log("✅ Allowed related hostname:", requestHostname);
        return true;
      }

      // Allow common CDNs
      //https://fancy-proxy.addison-r.workers.dev/?destination=https://moviking.neuronix.sbs/geturl

      const allowedCDNs = [
        "cdnjs.cloudflare.com",
        "cdn.jsdelivr.net",
        "cloudnestra.com",
        "workers.dev",
        "lordflix.club",
        "www.gstatic.com",
        "workers.dev",
        "unpkg.com",
        "fonts.googleapis.com",
        "fonts.gstatic.com",
        "cloudflare.com",
        "fastly.net",

        "akamaihd.net",
        "cloudfront.net",
      ];

      if (allowedCDNs.some((cdn) => requestHostname.includes(cdn))) {
        console.log("✅ Allowed CDN:", requestHostname);
        return true;
      }

      // Block ad domains
      const adDomains = [
        "doubleclick",
        "googleads",
        "googlesyndication",
        "adservice",
        "advertising",
        "adserver",
        "adsystem",
        "betting",
        "casino",
        "gamble",
        "gambling",
        "poker",
        "popads",
        "popcash",
        "exoclick",
        "propeller",
        "mgid",
        "revcontent",
        "taboola",
        "outbrain",
      ];

      if (adDomains.some((ad) => requestHostname.includes(ad))) {
        console.log("❌ BLOCKED ad domain:", requestHostname);
        return false;
      }

      // Block everything else
      console.log("❌ BLOCKED unrelated hostname:", requestHostname);
      return false;
    },
    [allowedHostname],
  );

  const renderEpisodeItem = useCallback(
    ({ item, index }: { item: Episode; index: number }) => {
      const isSelected = item.episode_number === selectedEpisode;
      const stillUrl = getImageUrl(item.still_path, "backdrop", "medium");

      return (
        <Animated.View
          key={item.id ?? item.episode_number ?? index}
          entering={FadeInUp.delay(index * 50)}
        >
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
                <ThemedText weight="600" style={styles.episodeNumberText}>
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
                  <ThemedText weight="800" style={styles.playingText}>
                    {t("now_playing")}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.episodeGridInfo}>
              <ThemedText
                weight="700"
                style={styles.episodeGridTitle}
                numberOfLines={1}
              >
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
                    {item.runtime} {t("minutes")}
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
            {
              top: insets.top + 10,
              [isRTL ? "right" : "left"]: Spacing.lg,
            },
          ]}
        >
          <Feather
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <Pressable
          onPress={() => {
            pauseMedia();
            navigation.navigate("FullscreenWatch", { videoUrl: videoUrl });
          }}
          style={[
            styles.fullscreenButton,
            {
              top: insets.top + 10,
              [isRTL ? "left" : "right"]: Spacing.lg,
            },
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
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setIsLoading(false)}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          originWhitelist={["*"]}
          mixedContentMode="always"
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          // incognito={true}
          onNavigationStateChange={(navState) => {
            const navHostname = getHostname(navState.url);
            const isAether = allowedHostname.includes("aether");

            // Allow proxy requests
            if (isProxyRequest(navState.url)) {
              console.log("✅ Allowed proxy request navigation");
              return;
            }

            // Aether exception: allow same-hostname navigation
            if (isAether && navHostname === allowedHostname) {
              console.log("✅ Aether: Allowed same-hostname navigation");
              return;
            }

            // Allow media, subtitles, workers, TMDB
            if (
              isMediaFile(navState.url) ||
              isSubtitleFile(navState.url) ||
              hasWorkerInUrl(navState.url) ||
              isTMDBRequest(navState.url)
            ) {
              return;
            }

            if (
              !areHostnamesRelated(allowedHostname, navHostname) &&
              navHostname !== ""
            ) {
              console.log(
                "⚠️ Detected navigation to unrelated domain:",
                navHostname,
              );
              webViewRef.current?.stopLoading();
            }
          }}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        <View style={styles.titleSection}>
          <ThemedText weight="700" style={styles.title} numberOfLines={2}>
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
          <ThemedText weight="600" style={styles.sectionTitle}>
            {t("select_server")}
          </ThemedText>
          <View style={styles.gridRow}>
            {servers &&
              Object.values(servers).map((server: any, idx) => (
                <Pressable
                  key={server.name}
                  onPress={() => handleServerPress(server.name)}
                  style={[
                    styles.serverGridItem,
                    {
                      backgroundColor:
                        selectedServer === server.name
                          ? theme.primary
                          : theme.backgroundSecondary,
                      width:
                        (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 3) / 4,
                    },
                  ]}
                >
                  <ThemedText
                    weight="700"
                    style={[
                      styles.serverGridText,
                      {
                        color:
                          selectedServer === server.name ? "#FFF" : theme.text,
                      },
                    ]}
                  >
                    {server.name}
                  </ThemedText>
                </Pressable>
              ))}
          </View>
        </View>

        {mediaType === "tv" ? (
          <>
            <View style={styles.seasonsSection}>
              <ThemedText weight="600" style={styles.sectionTitle}>
                {t("seasons")}
              </ThemedText>
              <View style={styles.gridRow}>
                {Array.from(
                  {
                    length: tvShowDetails?.number_of_seasons || selectedSeason,
                  },
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
                      weight="600"
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
              <ThemedText weight="600" style={styles.sectionTitle}>
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
                    {t("no_episodes_found")}
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
  },
  episodeGridInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: "space-between",
  },
  episodeGridTitle: {
    fontSize: 14,
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
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
