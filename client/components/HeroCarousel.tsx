import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ViewToken,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getImageUrl } from "@/utils/helpers";
import { Movie, TVShow, MediaType } from "@/types/tmdb";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_HEIGHT * 0.65;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HeroCarouselProps {
  data: (Movie | TVShow)[];
  onPlay: (id: number, mediaType: MediaType) => void;
  onInfo: (id: number, mediaType: MediaType) => void;
}

export function HeroCarousel({ data, onPlay, onInfo }: HeroCarouselProps) {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isMovie = (item: Movie | TVShow): item is Movie => "title" in item;

  const getMediaType = (item: Movie | TVShow): MediaType =>
    isMovie(item) ? "movie" : "tv";

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  useEffect(() => {
    if (data.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % data.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 6000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [activeIndex, data.length]);

  const renderItem = useCallback(
    ({ item, index }: { item: Movie | TVShow; index: number }) => {
      const title = isMovie(item) ? item.title : item.name;
      const mediaType = getMediaType(item);
      const backdropUrl = getImageUrl(item.backdrop_path, "backdrop", "original");
      const year = isMovie(item)
        ? item.release_date?.substring(0, 4)
        : item.first_air_date?.substring(0, 4);

      return (
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          {backdropUrl ? (
            <Image
              source={{ uri: backdropUrl }}
              style={styles.backdropImage}
              contentFit="cover"
              transition={500}
            />
          ) : (
            <View
              style={[
                styles.backdropImage,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            />
          )}

          <LinearGradient
            colors={["transparent", "rgba(10,10,10,0.5)", theme.backgroundRoot]}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          />

          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.contentContainer}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.badgeText}>
                  {mediaType === "movie" ? "MOVIE" : "SERIES"}
                </ThemedText>
              </View>
              {year ? (
                <View style={[styles.yearBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <ThemedText style={styles.yearText}>{year}</ThemedText>
                </View>
              ) : null}
            </View>

            <ThemedText style={styles.title} numberOfLines={2}>
              {title}
            </ThemedText>

            <ThemedText
              style={[styles.overview, { color: theme.textSecondary }]}
              numberOfLines={3}
            >
              {item.overview}
            </ThemedText>

            <View style={styles.buttonRow}>
              <HeroButton
                icon="play"
                label="PLAY"
                variant="primary"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onPlay(item.id, mediaType);
                }}
              />
              <HeroButton
                icon="info"
                label="INFO"
                variant="secondary"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onInfo(item.id, mediaType);
                }}
              />
            </View>
          </Animated.View>
        </View>
      );
    },
    [theme, onPlay, onInfo]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
      />

      <View style={styles.dotsContainer}>
        {data.map((_, index) => (
          <ProgressDot key={index} isActive={index === activeIndex} />
        ))}
      </View>
    </View>
  );
}

interface HeroButtonProps {
  icon: string;
  label: string;
  variant: "primary" | "secondary";
  onPress: () => void;
}

function HeroButton({ icon, label, variant, onPress }: HeroButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isPrimary = variant === "primary";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.heroButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        animatedStyle,
      ]}
    >
      <Feather
        name={icon as any}
        size={18}
        color={isPrimary ? "#000000" : "#FFFFFF"}
      />
      <ThemedText
        style={[
          styles.buttonLabel,
          { color: isPrimary ? "#000000" : "#FFFFFF" },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

interface ProgressDotProps {
  isActive: boolean;
}

function ProgressDot({ isActive }: ProgressDotProps) {
  const { theme } = useTheme();
  const width = useSharedValue(isActive ? 24 : 8);

  useEffect(() => {
    width.value = withTiming(isActive ? 24 : 8, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isActive, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: isActive ? theme.primary : "rgba(255,255,255,0.3)",
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
  },
  slide: {
    height: HERO_HEIGHT,
    position: "relative",
  },
  backdropImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.7,
  },
  contentContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 60,
    paddingHorizontal: Spacing.lg,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  yearBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  yearText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: Spacing.sm,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  overview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dotsContainer: {
    position: "absolute",
    bottom: Spacing.xl,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
