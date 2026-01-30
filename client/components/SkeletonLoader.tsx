import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  Dimensions,
  DimensionValue,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;

interface SkeletonLoaderProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width,
  height,
  borderRadius = BorderRadius.md,
  style,
}: SkeletonLoaderProps) {
  const { theme } = useTheme();
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [shimmerPosition]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH],
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.skeleton,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={["transparent", theme.skeletonHighlight, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

interface MediaCardSkeletonProps {
  style?: ViewStyle;
  size?: "small" | "medium" | "large";
}

export function MediaCardSkeleton({
  style,
  size = "medium",
}: MediaCardSkeletonProps) {
  const dimensions = {
    small: { width: 100, height: 150 },
    medium: { width: 140, height: 210 },
    large: { width: CARD_WIDTH, height: CARD_WIDTH * 1.5 },
  };

  const { width, height } = dimensions[size];

  return (
    <View style={[{ width }, style]}>
      <SkeletonLoader
        width={width}
        height={height}
        borderRadius={BorderRadius.lg}
      />
      <View style={styles.mediaCardInfo}>
        <SkeletonLoader
          width={width * 0.85}
          height={14}
          borderRadius={BorderRadius.xs}
        />
        <SkeletonLoader
          width={width * 0.6}
          height={12}
          borderRadius={BorderRadius.xs}
          style={{ marginTop: 6 }}
        />
      </View>
    </View>
  );
}

export function HeroSkeleton() {
  return (
    <View style={styles.heroSkeleton}>
      <SkeletonLoader
        width="100%"
        height={SCREEN_HEIGHT * 0.65}
        borderRadius={0}
      />
      <View style={styles.heroSkeletonContent}>
        <SkeletonLoader
          width={100}
          height={20}
          borderRadius={BorderRadius.sm}
          style={{ marginBottom: Spacing.md }}
        />
        <SkeletonLoader
          width={250}
          height={40}
          borderRadius={BorderRadius.sm}
          style={{ marginBottom: Spacing.md }}
        />
        <SkeletonLoader
          width="90%"
          height={60}
          borderRadius={BorderRadius.sm}
          style={{ marginBottom: Spacing.xl }}
        />
        <View style={styles.heroSkeletonButtons}>
          <SkeletonLoader
            width={120}
            height={48}
            borderRadius={BorderRadius.sm}
          />
          <SkeletonLoader
            width={120}
            height={48}
            borderRadius={BorderRadius.sm}
          />
        </View>
      </View>
    </View>
  );
}

export function SectionSkeleton() {
  return (
    <View style={styles.section}>
      <SkeletonLoader
        width={150}
        height={20}
        borderRadius={BorderRadius.xs}
        style={{ marginBottom: 16 }}
      />
      <View style={styles.horizontalList}>
        {[1, 2, 3].map((i) => (
          <MediaCardSkeleton key={i} style={{ marginEnd: 12 }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  shimmer: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  mediaCardInfo: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  horizontalList: {
    flexDirection: "row",
  },
  heroSkeleton: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.65,
    position: "relative",
  },
  heroSkeletonContent: {
    position: "absolute",
    bottom: 50,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  heroSkeletonButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
});
