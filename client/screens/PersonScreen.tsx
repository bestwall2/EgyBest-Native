import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { MediaCard } from "@/components/MediaCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { PersonDetails, Movie, MediaType } from "@/types/tmdb";
import { getImageUrl, isMovie } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PersonRouteProp = RouteProp<RootStackParamList, "Person">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PersonScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PersonRouteProp>();
  const { id } = route.params;

  const { data: person, isLoading } = useQuery<PersonDetails>({
    queryKey: [`/api/tmdb/person/${id}?append_to_response=combined_credits`],
  });

  const handleItemPress = useCallback(
    (itemId: number, mediaType: MediaType) => {
      navigation.push("Detail", { id: itemId, mediaType });
    },
    [navigation],
  );

  if (isLoading || !person) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  const profileUrl = getImageUrl(person.profile_path, "profile", "large");

  // Combine cast and crew credits and deduplicate
  const allCredits = [
    ...(person.combined_credits?.cast || []),
    ...(person.combined_credits?.crew || []),
  ];

  const uniqueCreditsMap = new Map();
  allCredits.forEach((item) => {
    const mediaType =
      (item as any).media_type || (isMovie(item) ? "movie" : "tv");
    const key = `${item.id}-${mediaType}`;
    if (!uniqueCreditsMap.has(key)) {
      uniqueCreditsMap.set(key, { ...item, media_type: mediaType });
    }
  });
  const uniqueCredits = Array.from(uniqueCreditsMap.values());

  const knownForMovies = uniqueCredits
    .filter((item) => item.media_type === "movie")
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 20);

  const knownForTV = uniqueCredits
    .filter((item) => item.media_type === "tv")
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 20);

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(person.birthday, person.deathday);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        <View style={styles.headerSection}>
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.profileImageContainer}
          >
            {profileUrl ? (
              <Image
                source={{ uri: profileUrl }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.profileImage,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              />
            )}
            <LinearGradient
              colors={["transparent", theme.backgroundRoot]}
              style={styles.profileGradient}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.infoContainer}
          >
            <ThemedText style={styles.name}>{person.name}</ThemedText>
            <ThemedText style={[styles.department, { color: theme.primary }]}>
              {person.known_for_department}
            </ThemedText>

            <View style={styles.statsRow}>
              {person.birthday ? (
                <View
                  style={[
                    styles.statItem,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    Born
                  </ThemedText>
                  <ThemedText style={styles.statValue}>
                    {formatDate(person.birthday)}
                  </ThemedText>
                  {age !== null ? (
                    <ThemedText
                      style={[styles.statAge, { color: theme.textSecondary }]}
                    >
                      ({age} years{person.deathday ? " old" : ""})
                    </ThemedText>
                  ) : null}
                </View>
              ) : null}
              {person.place_of_birth ? (
                <View
                  style={[
                    styles.statItem,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    From
                  </ThemedText>
                  <ThemedText style={styles.statValue} numberOfLines={2}>
                    {person.place_of_birth}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </Animated.View>
        </View>

        {person.biography ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Biography</ThemedText>
            <ThemedText
              style={[styles.biography, { color: theme.textSecondary }]}
            >
              {person.biography}
            </ThemedText>
          </View>
        ) : null}

        {knownForMovies.length > 0 ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Movies</ThemedText>
            <FlatList
              horizontal
              data={knownForMovies}
              keyExtractor={(item) => `movie-${item.id}`}
              renderItem={({ item }) => (
                <MediaCard
                  id={item.id}
                  title={(item as Movie).title || ""}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  releaseDate={(item as Movie).release_date || ""}
                  mediaType="movie"
                  onPress={() => handleItemPress(item.id, "movie")}
                  size="small"
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.creditsList}
            />
          </View>
        ) : null}

        {knownForTV.length > 0 ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>TV Shows</ThemedText>
            <FlatList
              horizontal
              data={knownForTV}
              keyExtractor={(item) => `tv-${item.id}`}
              renderItem={({ item }) => (
                <MediaCard
                  id={item.id}
                  title={(item as any).name || ""}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  releaseDate={(item as any).first_air_date || ""}
                  mediaType="tv"
                  onPress={() => handleItemPress(item.id, "tv")}
                  size="small"
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.creditsList}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    marginBottom: Spacing.xl,
  },
  profileImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  infoContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: -80,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  department: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statAge: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  biography: {
    fontSize: 15,
    lineHeight: 24,
  },
  creditsList: {
    paddingRight: Spacing.lg,
  },
});
