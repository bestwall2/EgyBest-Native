import React from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
  FadeInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { RatingBadge } from "@/components/RatingBadge";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { BorderRadius, Spacing } from "@/constants/theme";
import { getImageUrl, formatYear } from "@/utils/helpers";
import { MediaType } from "@/types/tmdb";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

interface MediaCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  mediaType: MediaType;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_SIZES = {
  small: { width: 100, height: 150 },
  medium: { width: 140, height: 210 },
  large: { width: 160, height: 240 },
};

export function MediaCard({
  id,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  mediaType,
  onPress,
  size = "medium",
}: MediaCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const scale = useSharedValue(1);
  const { width, height } = CARD_SIZES[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const imageUrl = getImageUrl(posterPath, "poster", "medium");

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(400)}
      testID={`media-card-${mediaType}-${id}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, { width }, animatedStyle]}
    >
      <View
        style={[
          styles.posterContainer,
          { width, height, backgroundColor: theme.backgroundSecondary },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.poster}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText style={styles.placeholderText}>
              {t("no_description").split(" ")[0]}
            </ThemedText>
          </View>
        )}
        {voteAverage > 0 ? (
          <View style={styles.ratingContainer}>
            <RatingBadge rating={voteAverage} size="small" showIcon={true} />
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <ThemedText weight="500" style={styles.title} numberOfLines={2}>
          {title}
        </ThemedText>
        {releaseDate ? (
          <ThemedText style={[styles.year, { color: theme.textSecondary }]}>
            {formatYear(releaseDate)}
          </ThemedText>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

interface HeroCardProps {
  id: number;
  title: string;
  backdropPath: string | null;
  overview: string;
  voteAverage: number;
  mediaType: MediaType;
  onPress?: () => void;
}

export function HeroCard({
  id,
  title,
  backdropPath,
  overview,
  voteAverage,
  mediaType,
  onPress,
}: HeroCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const imageUrl = getImageUrl(backdropPath, "backdrop", "large");

  return (
    <AnimatedPressable
      testID={`hero-card-${mediaType}-${id}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.heroContainer, animatedStyle]}
    >
      <View
        style={[
          styles.heroImageContainer,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
        ) : null}
        <LinearGradient
          colors={["transparent", "rgba(10,10,10,0.8)", theme.backgroundRoot]}
          style={styles.heroGradient}
        />
      </View>
      <View style={styles.heroContent}>
        <ThemedText weight="700" style={styles.heroTitle} numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText
          style={[styles.heroOverview, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {overview}
        </ThemedText>
        <View style={styles.heroMeta}>
          <RatingBadge rating={voteAverage} size="small" showIcon={true} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginEnd: Spacing.md,
  },
  posterContainer: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    opacity: 0.5,
  },
  ratingContainer: {
    position: "absolute",
    top: Spacing.xs,
    end: Spacing.xs,
  },
  info: {
    marginTop: Spacing.sm,
    paddingEnd: Spacing.xs,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
  },
  year: {
    fontSize: 12,
    marginTop: 2,
  },
  heroContainer: {
    width: "100%",
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  heroImageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    start: 0,
    end: 0,
    bottom: 0,
    height: 120,
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    start: 0,
    end: 0,
    padding: Spacing.lg,
  },
  heroTitle: {
    fontSize: 22,
    marginBottom: Spacing.xs,
  },
  heroOverview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
});
