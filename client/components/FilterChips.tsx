import React from "react";
import { ScrollView, StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Genre } from "@/types/tmdb";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

interface FilterChipsProps {
  genres: Genre[];
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
}

export function FilterChips({
  genres,
  selectedGenreId,
  onSelectGenre,
}: FilterChipsProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handlePress = (genreId: number | null) => {
    Haptics.selectionAsync();
    onSelectGenre(genreId);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <FilterChip
        label={t("all")}
        isSelected={selectedGenreId === null}
        onPress={() => handlePress(null)}
      />
      {genres.map((genre) => (
        <FilterChip
          key={genre.id}
          label={genre.name}
          isSelected={selectedGenreId === genre.id}
          onPress={() => handlePress(genre.id)}
        />
      ))}
    </ScrollView>
  );
}

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? theme.primary
            : theme.backgroundSecondary,
          borderColor: isSelected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        weight="500"
        style={[
          styles.chipText,
          {
            color: isSelected ? "#FFFFFF" : theme.text,
          },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

interface TabSwitchProps {
  tabs: string[];
  selectedIndex: number;
  onSelectTab: (index: number) => void;
}

export function TabSwitch({
  tabs,
  selectedIndex,
  onSelectTab,
}: TabSwitchProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.tabContainer,
        { backgroundColor: theme.backgroundSecondary },
      ]}
    >
      {tabs.map((tab, index) => {
        const isSelected = selectedIndex === index;
        return (
          <TabItem
            key={tab}
            label={tab}
            isSelected={isSelected}
            onPress={() => {
              Haptics.selectionAsync();
              onSelectTab(index);
            }}
          />
        );
      })}
    </View>
  );
}

function TabItem({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tab,
        {
          backgroundColor: isSelected ? theme.primary : "transparent",
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        weight="600"
        style={[
          styles.tabText,
          {
            color: isSelected ? "#FFFFFF" : theme.textSecondary,
          },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginEnd: Spacing.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
  },
});
