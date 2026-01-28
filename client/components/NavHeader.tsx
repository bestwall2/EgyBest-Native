import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface NavHeaderProps {
  scrollY?: Animated.SharedValue<number>;
  onSettingsPress?: () => void;
  onSearchPress?: () => void;
}

export function NavHeader({
  scrollY,
  onSettingsPress,
  onSearchPress,
}: NavHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { opacity: 0.85 };
    }
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0.4, 0.95],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        style={[
          styles.background,
          { backgroundColor: "rgba(10,10,10,0.85)" },
          animatedStyle,
        ]}
      />

      <View style={styles.content}>
        <NavButton icon="settings" onPress={onSettingsPress} />

        <View style={styles.logoContainer}>
          <ThemedText style={[styles.logo, { color: theme.primary }]}>
            EGYBEST
          </ThemedText>
        </View>

        <NavButton icon="search" onPress={onSearchPress} />
      </View>
    </View>
  );
}

interface NavButtonProps {
  icon: string;
  onPress?: () => void;
}

function NavButton({ icon, onPress }: NavButtonProps) {
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
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.iconButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name={icon as any} size={22} color={theme.text} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
