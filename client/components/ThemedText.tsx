import { Text, type TextProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography, Fonts } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "hero"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body"
    | "small"
    | "caption"
    | "link"
    | "logo";
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
      case "logo":
        return Fonts.extraBold;
      case "hero":
      case "h1":
      case "h2":
      case "h3":
      case "h4":
        return Fonts.bold;
      case "body":
      case "link":
      case "small":
      case "caption":
        return Fonts.semiBold;
      default:
        return Fonts.semiBold;
    }
  };

  return (
    <Text
      {...rest}
      style={[
        {
          color,
          fontFamily: getFontFamily(),
          padding: 2, // Small padding to all text elements
        },
        Typography[type === "logo" ? "h1" : type] || Typography.body,
        style,
      ]}
    />
  );
}
