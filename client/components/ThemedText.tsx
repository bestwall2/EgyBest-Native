import { Text, type TextProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography, Fonts } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "hero" | "h1" | "h2" | "h3" | "h4" | "body" | "small" | "caption" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  ...rest
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  const color =
    isDark && darkColor
      ? darkColor
      : !isDark && lightColor
      ? lightColor
      : type === "link"
      ? theme.link
      : theme.text;

  // Map Typography types to Cairo font weights
  const getFontFamily = () => {
    switch (type) {
      case "hero":
      case "h1":
        return Fonts.bold;
      case "h2":
      case "h3":
      case "h4":
        return Fonts.semiBold;
      case "body":
      case "link":
        return Fonts.regular;
      case "small":
      case "caption":
        return Fonts.medium;
      default:
        return Fonts.regular;
    }
  };

  return (
    <Text
      {...rest}
      style={[
        {
          color,
          fontFamily: getFontFamily(),
        },
        Typography[type] || Typography.body,
        style,
      ]}
    />
  );
}
