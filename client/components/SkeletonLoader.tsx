import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
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
import { BorderRadius } from "@/constants/theme";

interface SkeletonLoaderProps {
  width: number | string;
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
      false
    );
  }, [shimmerPosition]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [0, 1],
      [-200, 200]
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
          colors={[
            "transparent",
            theme.skeletonHighlight,
            "transparent",
          ]}
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
}

export function MediaCardSkeleton({ style }: MediaCardSkeletonProps) {
  return (
    <View style={[styles.mediaCard, style]}>
      <SkeletonLoader width={140} height={210} borderRadius={BorderRadius.md} />
      <View style={styles.mediaCardInfo}>
        <SkeletonLoader width={120} height={14} borderRadius={BorderRadius.xs} />
        <SkeletonLoader
          width={80}
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
    <SkeletonLoader
      width="100%"
      height={220}
      borderRadius={BorderRadius.lg}
      style={{ marginBottom: 24 }}
    />
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
          <MediaCardSkeleton key={i} style={{ marginRight: 12 }} />
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
    width: 200,
    height: "100%",
  },
  mediaCard: {
    width: 140,
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
});
