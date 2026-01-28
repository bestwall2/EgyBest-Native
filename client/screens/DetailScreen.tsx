import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Share,
  FlatList,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { RatingBadge } from "@/components/RatingBadge";
import { CastCard } from "@/components/CastCard";
import { MediaCard } from "@/components/MediaCard";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  MovieDetails,
  TVShowDetails,
  MediaType,
  MediaItem,
} from "@/types/tmdb";
import {
  getImageUrl,
  formatYear,
  formatRuntime,
  isMovie,
} from "@/utils/helpers";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  addToFavorites,
  removeFromFavorites,
  isInFavorites,
  addToWatchHistory,
} from "@/services/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRouteProp = RouteProp<RootStackParamList, "Detail">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { id, mediaType } = route.params;

  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);

  const {
    data: details,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MovieDetails | TVShowDetails>({
    queryKey: [`/api/tmdb/${mediaType}/${id}?append_to_response=credits,videos,similar,recommendations`],
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    const checkStatus = async () => {
      const [watchlistStatus, favoritesStatus] = await Promise.all([
        isInWatchlist(id, mediaType),
        isInFavorites(id, mediaType),
      ]);
      setInWatchlist(watchlistStatus);
      setInFavorites(favoritesStatus);
    };
    checkStatus();
  }, [id, mediaType]);

  useEffect(() => {
    if (details) {
      const mediaItem = createMediaItem(details);
      addToWatchHistory(mediaItem);
    }
  }, [details]);

  const createMediaItem = (data: MovieDetails | TVShowDetails): MediaItem => {
    if ("title" in data) {
      return {
        id: data.id,
        mediaType: "movie",
        title: data.title,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        voteAverage: data.vote_average,
        releaseDate: data.release_date,
        overview: data.overview,
      };
    }
    return {
      id: data.id,
      mediaType: "tv",
      title: data.name,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      voteAverage: data.vote_average,
      releaseDate: data.first_air_date,
      overview: data.overview,
    };
  };

  const handleWatchlistToggle = async () => {
    if (!details) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const mediaItem = createMediaItem(details);

    if (inWatchlist) {
      await removeFromWatchlist(id, mediaType);
      setInWatchlist(false);
    } else {
      await addToWatchlist(mediaItem);
      setInWatchlist(true);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!details) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const mediaItem = createMediaItem(details);

    if (inFavorites) {
      await removeFromFavorites(id, mediaType);
      setInFavorites(false);
    } else {
      await addToFavorites(mediaItem);
      setInFavorites(true);
    }
  };

  const handleShare = async () => {
    if (!details) return;
    const title = "title" in details ? details.title : details.name;
    try {
      await Share.share({
        message: `Check out ${title} on EGYBEST!`,
        title: title,
      });
    } catch {}
  };

  const handlePlay = () => {
    if (!details) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const title = "title" in details ? details.title : details.name;
    navigation.navigate("Watch", {
      id,
      mediaType,
      title,
      season: 1,
      episode: 1,
    });
  };

  const handleTrailer = () => {
    if (!details) return;
    const trailer = details.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    if (trailer) {
      Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
    }
  };

  const handlePersonPress = (personId: number) => {
    navigation.navigate("Person", { id: personId });
  };

  const handleItemPress = useCallback(
    (itemId: number, type: MediaType) => {
      navigation.push("Detail", { id: itemId, mediaType: type });
    },
    [navigation]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loadingText}>Loading details...</ThemedText>
        </View>
      </View>
    );
  }

  if (isError || !details) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.primary} />
          <ThemedText style={styles.errorTitle}>Failed to load details</ThemedText>
          <ThemedText style={[styles.errorMessage, { color: theme.textSecondary }]}>
            {error?.message || "Something went wrong. Please try again."}
          </ThemedText>
          <Button onPress={() => refetch()} style={styles.retryButton}>
            Try Again
          </Button>
        </View>
      </View>
    );
  }

  const title = "title" in details ? details.title : details.name;
  const releaseDate = "release_date" in details ? details.release_date : details.first_air_date;
  const runtime = "runtime" in details ? details.runtime : details.episode_run_time?.[0] || 0;
  const backdropUrl = getImageUrl(details.backdrop_path, "backdrop", "large");
  const posterUrl = getImageUrl(details.poster_path, "poster", "large");
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const trailer = details.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const similar = details.similar?.results?.slice(0, 10) || [];
  const genres = details.genres?.map((g) => g.name).join(", ");

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backdropContainer}>
          {backdropUrl ? (
            <Image
              source={{ uri: backdropUrl }}
              style={styles.backdrop}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.backdrop, { backgroundColor: theme.backgroundSecondary }]} />
          )}
          <LinearGradient
            colors={["transparent", `${theme.backgroundRoot}99`, theme.backgroundRoot]}
            style={styles.backdropGradient}
          />
        </View>

        <Animated.View entering={FadeIn.duration(400)} style={[styles.content, { marginTop: -80 }]}>
          <View style={styles.posterRow}>
            <View style={styles.posterContainer}>
              {posterUrl ? (
                <Image source={{ uri: posterUrl }} style={styles.poster} contentFit="cover" transition={300} />
              ) : (
                <View style={[styles.poster, { backgroundColor: theme.backgroundSecondary }]} />
              )}
            </View>
            <View style={styles.metaContainer}>
              <ThemedText style={styles.title} numberOfLines={3}>
                {title}
              </ThemedText>
              <View style={styles.metaRow}>
                <RatingBadge rating={details.vote_average} size="medium" />
                <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                  {formatYear(releaseDate)}
                </ThemedText>
                {runtime > 0 ? (
                  <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                    {formatRuntime(runtime)}
                  </ThemedText>
                ) : null}
              </View>
              {genres ? (
                <ThemedText style={[styles.genres, { color: theme.textSecondary }]} numberOfLines={2}>
                  {genres}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.playButtonsRow}>
            <Pressable onPress={handlePlay} style={[styles.playButton, { backgroundColor: theme.primary }]}>
              <Feather name="play" size={20} color="#FFFFFF" />
              <ThemedText style={styles.playButtonText}>Watch Now</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleWatchlistToggle}
              style={[styles.infoButton, { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "#FFFFFF" }]}
            >
              <Feather name={inWatchlist ? "check" : "plus"} size={20} color="#FFFFFF" />
              <ThemedText style={styles.infoButtonText}>{inWatchlist ? "Added" : "My List"}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              icon={inFavorites ? "heart" : "heart"}
              label="Favorite"
              onPress={handleFavoriteToggle}
              isActive={inFavorites}
            />
            {trailer ? (
              <ActionButton icon="youtube" label="Trailer" onPress={handleTrailer} isActive={false} />
            ) : null}
            <ActionButton icon="share" label="Share" onPress={handleShare} isActive={false} />
          </View>

          {details.overview ? (
            <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
              <Pressable onPress={() => setShowFullOverview(!showFullOverview)}>
                <ThemedText
                  style={[styles.overview, { color: theme.textSecondary }]}
                  numberOfLines={showFullOverview ? undefined : 4}
                >
                  {details.overview}
                </ThemedText>
                {details.overview.length > 200 ? (
                  <ThemedText style={[styles.readMore, { color: theme.primary }]}>
                    {showFullOverview ? "Show less" : "Read more"}
                  </ThemedText>
                ) : null}
              </Pressable>
            </Animated.View>
          ) : null}

          {cast.length > 0 ? (
            <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Cast</ThemedText>
              <FlatList
                horizontal
                data={cast}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <CastCard cast={item} onPress={() => handlePersonPress(item.id)} />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castList}
              />
            </Animated.View>
          ) : null}

          {similar.length > 0 ? (
            <Animated.View entering={FadeInUp.delay(300).duration(300)} style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Similar</ThemedText>
              <FlatList
                horizontal
                data={similar}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const itemTitle = isMovie(item) ? item.title : (item as any).name;
                  const itemDate = isMovie(item) ? item.release_date : (item as any).first_air_date;
                  return (
                    <MediaCard
                      id={item.id}
                      title={itemTitle}
                      posterPath={item.poster_path}
                      voteAverage={item.vote_average}
                      releaseDate={itemDate}
                      mediaType={mediaType}
                      onPress={() => handleItemPress(item.id, mediaType)}
                      size="small"
                    />
                  );
                }}
                showsHorizontalScrollIndicator={false}
              />
            </Animated.View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.floatingButton,
          {
            bottom: insets.bottom + Spacing.xl,
            backgroundColor: theme.primary,
            ...Shadows.floating,
          },
        ]}
      >
        <Pressable
          onPress={handlePlay}
          style={({ pressed }) => [styles.floatingButtonInner, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="play" size={20} color="#FFFFFF" />
          <ThemedText style={styles.floatingButtonText}>Watch Now</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  isActive: boolean;
}

function ActionButton({ icon, label, onPress, isActive }: ActionButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.actionButton}>
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: isActive ? theme.primary : theme.backgroundSecondary },
          ]}
        >
          <Feather name={icon as any} size={20} color={isActive ? "#FFFFFF" : theme.text} />
        </View>
        <ThemedText style={[styles.actionLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: Spacing.md, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing["3xl"] },
  errorTitle: { fontSize: 18, fontWeight: "600", marginTop: Spacing.lg, marginBottom: Spacing.sm },
  errorMessage: { fontSize: 14, textAlign: "center", marginBottom: Spacing.xl },
  retryButton: { paddingHorizontal: Spacing["3xl"] },
  backdropContainer: { height: 280, position: "relative" },
  backdrop: { width: "100%", height: "100%" },
  backdropGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 160 },
  content: { paddingHorizontal: Spacing.lg },
  posterRow: { flexDirection: "row", marginBottom: Spacing.xl },
  posterContainer: { width: 120, height: 180, borderRadius: BorderRadius.lg, overflow: "hidden", ...Shadows.card },
  poster: { width: "100%", height: "100%" },
  metaContainer: { flex: 1, marginLeft: Spacing.lg, justifyContent: "flex-end" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: Spacing.sm },
  metaRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.xs },
  metaText: { fontSize: 14 },
  genres: { fontSize: 13, marginTop: Spacing.xs },
  playButtonsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  playButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  playButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  infoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  infoButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  actionsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: Spacing.xl, paddingVertical: Spacing.md },
  actionButton: { alignItems: "center" },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  actionLabel: { fontSize: 12 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.md },
  overview: { fontSize: 15, lineHeight: 24 },
  readMore: { fontSize: 14, fontWeight: "500", marginTop: Spacing.xs },
  castList: { paddingRight: Spacing.lg },
  floatingButton: { position: "absolute", left: Spacing.lg, right: Spacing.lg, borderRadius: BorderRadius.lg, overflow: "hidden" },
  floatingButtonInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, gap: Spacing.sm },
  floatingButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
