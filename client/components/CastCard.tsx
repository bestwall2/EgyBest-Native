import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { getImageUrl } from "@/utils/helpers";
import { CastMember } from "@/types/tmdb";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

interface CastCardProps {
  cast: CastMember;
  onPress?: () => void;
}

export function CastCard({ cast, onPress }: CastCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const imageUrl = getImageUrl(cast.profile_path, "profile", "medium");

  return (
    <AnimatedPressable
      testID={`cast-card-${cast.id}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.placeholder}>
            <Feather name="user" size={24} color={theme.textSecondary} />
          </View>
        )}
      </View>
      <ThemedText style={styles.name} numberOfLines={1}>
        {cast.name}
      </ThemedText>
      <ThemedText
        style={[styles.character, { color: theme.textSecondary }]}
        numberOfLines={1}
      >
        {cast.character}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    marginEnd: Spacing.md,
    alignItems: "center",
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  character: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
});
