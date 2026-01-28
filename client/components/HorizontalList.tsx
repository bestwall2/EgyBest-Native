import React from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { MediaCard } from "@/components/MediaCard";
import { MediaCardSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";
import { Movie, TVShow, MediaType } from "@/types/tmdb";
import { isMovie } from "@/utils/helpers";

interface HorizontalListProps {
  title: string;
  data: (Movie | TVShow)[];
  mediaType?: MediaType;
  isLoading?: boolean;
  onItemPress?: (id: number, mediaType: MediaType) => void;
  onSeeAllPress?: () => void;
  showSeeAll?: boolean;
}

export function HorizontalList({
  title,
  data,
  mediaType,
  isLoading = false,
  onItemPress,
  onSeeAllPress,
  showSeeAll = false,
}: HorizontalListProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
        <FlatList
          horizontal
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <MediaCardSkeleton />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {showSeeAll ? (
          <Pressable
            onPress={onSeeAllPress}
            style={({ pressed }) => [
              styles.seeAllButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ThemedText style={[styles.seeAllText, { color: theme.primary }]}>
              See All
            </ThemedText>
            <Feather name="chevron-right" size={16} color={theme.primary} />
          </Pressable>
        ) : null}
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) =>
          `${mediaType || (isMovie(item) ? "movie" : "tv")}-${item.id}`
        }
        renderItem={({ item }) => {
          const type = mediaType || (isMovie(item) ? "movie" : "tv");
          const itemTitle = isMovie(item) ? item.title : item.name;
          const releaseDate = isMovie(item)
            ? item.release_date
            : item.first_air_date;

          return (
            <MediaCard
              id={item.id}
              title={itemTitle}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              releaseDate={releaseDate}
              mediaType={type}
              onPress={() => onItemPress?.(item.id, type)}
            />
          );
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    fontWeight: "600",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
});
