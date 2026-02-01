import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getImageUrl } from "@/utils/helpers";
import { Movie, TVShow, MediaType, TMDBImages } from "@/types/tmdb";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HERO_HEIGHT = SCREEN_HEIGHT * 0.65;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HeroCarouselProps {
  data: (Movie | TVShow)[];
  onPlay: (id: number, mediaType: MediaType) => void;
  onInfo: (id: number, mediaType: MediaType) => void;
}

function HeroSlide({
  item,
  onPlay,
  onInfo,
}: {
  item: Movie | TVShow;
  onPlay: (id: number, mediaType: MediaType) => void;
  onInfo: (id: number, mediaType: MediaType) => void;
}) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isMovie = "title" in item;
  const title = isMovie ? item.title : item.name;
  const mediaType = isMovie ? "movie" : "tv";
  const backdropUrl = getImageUrl(item.backdrop_path, "backdrop", "original");
  const year = isMovie
    ? item.release_date?.substring(0, 4)
    : item.first_air_date?.substring(0, 4);

  const { data: images } = useQuery<TMDBImages>({
    queryKey: [`/api/tmdb/${mediaType}/${item.id}/images`],
  });

  const logo =
    images?.logos?.find((l) => l.iso_639_1 === "en") || images?.logos?.[0];
  const logoUrl = logo
    ? getImageUrl(logo.file_path, "poster", "original")
    : null;

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
              {mediaType === "movie" ? t("movie") : t("series")}
            </ThemedText>
          </View>
          {year ? (
            <View
              style={[
                styles.yearBadge,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <ThemedText style={styles.yearText}>{year}</ThemedText>
            </View>
          ) : null}
        </View>

        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={styles.logoTitle}
            contentFit="contain"
            transition={300}
          />
        ) : (
          <ThemedText type="logo" style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
        )}

        <ThemedText
          style={[styles.overview, { color: theme.textSecondary }]}
          numberOfLines={3}
        >
          {item.overview}
        </ThemedText>

        <View style={styles.buttonRow}>
          <HeroButton
            icon="play"
            label={t("play")}
            variant="primary"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onPlay(item.id, mediaType);
            }}
          />
          <HeroButton
            icon="info"
            label={t("info")}
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
}

export function HeroCarousel({ data, onPlay, onInfo }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
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
    ({ item }: { item: Movie | TVShow }) => (
      <HeroSlide item={item} onPlay={onPlay} onInfo={onInfo} />
    ),
    [onPlay, onInfo],
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
    <View style={styles.heroButtonWrapper}>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)"]}
        style={StyleSheet.absoluteFill}
      />
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
    </View>
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
    bottom: 40,
    paddingHorizontal: Spacing.lg,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
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
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    lineHeight: 28,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoTitle: {
    width: 160,
    height: 64,
    marginBottom: 12,
    alignSelf: "flex-start",
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
  heroButtonWrapper: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 0,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "600",
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
