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
          paddingVertical: padding / 2,
          backgroundColor: `${color}20`,
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
      <ThemedText style={[styles.text, { fontSize, color }]}>
        {formatRating(rating)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  icon: {
    marginEnd: 4,
  },
  text: {
    fontWeight: "600",
  },
});
