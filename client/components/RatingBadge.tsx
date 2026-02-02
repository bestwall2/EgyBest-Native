import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadius, Spacing } from "@/constants/theme";
import { formatRating, getRatingColor } from "@/utils/helpers";

interface RatingBadgeProps {
  rating: number;
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
}

export function RatingBadge({
  rating,
  size = "medium",
  showIcon = true,
}: RatingBadgeProps) {
  const color = getRatingColor(rating);

  const dimensions = {
    small: { padding: Spacing.xs, fontSize: 10, iconSize: 10 },
    medium: { padding: Spacing.sm, fontSize: 12, iconSize: 12 },
    large: { padding: Spacing.md, fontSize: 14, iconSize: 14 },
  };

  const { padding, fontSize, iconSize } = dimensions[size];

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: padding,
          paddingVertical: 0.5,
          backgroundColor: `${color}50`,
          shadowColor: color,
          borderColor: color,
        },
      ]}
    >
      {showIcon ? (
        <Feather
          name="star"
          size={iconSize}
          color={color}
          style={styles.icon}
        />
      ) : null}
      <ThemedText weight="600" style={[styles.text, { fontSize, color }]}>
        {formatRating(rating)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  icon: {
    marginEnd: 4,
  },
  text: {},
});
