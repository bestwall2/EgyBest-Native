import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = "Search movies, shows...",
  autoFocus = false,
}: SearchBarProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = useSharedValue(1);
  const borderOpacity = useSharedValue(0.3);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    borderColor: `rgba(229, 9, 20, ${borderOpacity.value})`,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0.3, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handleClear = () => {
    onChangeText("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundSecondary },
        animatedStyle,
      ]}
    >
      <Feather
        name="search"
        size={20}
        color={isFocused ? theme.primary : theme.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        ref={inputRef}
        testID="search-input"
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [
            styles.clearButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View
            style={[
              styles.clearIconContainer,
              { backgroundColor: theme.textSecondary },
            ]}
          >
            <Feather name="x" size={12} color={theme.backgroundRoot} />
          </View>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginHorizontal: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm : 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
  },
  clearIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
});
