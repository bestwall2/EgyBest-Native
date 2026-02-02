import { Text, type TextProps, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Typography, Fonts } from "@/constants/theme";

export type FontWeight =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | "bold"
  | "normal";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  weight?: FontWeight;
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
  weight,
  ...rest
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();
  const { isRTL } = useLanguage();

  const color =
    isDark && darkColor
      ? darkColor
      : !isDark && lightColor
        ? lightColor
        : type === "link"
          ? theme.link
          : theme.text;

  // Map Typography types and weight prop to Cairo font weights
  const getFontFamily = () => {
    if (weight) {
      switch (weight) {
        case "100":
        case "200":
          return Fonts.extraLight;
        case "300":
          return Fonts.light;
        case "400":
        case "normal":
          return Fonts.regular;
        case "500":
          return Fonts.medium;
        case "600":
          return Fonts.semiBold;
        case "700":
        case "bold":
          return Fonts.bold;
        case "800":
          return Fonts.extraBold;
        case "900":
          return Fonts.black;
        default:
          return Fonts.regular;
      }
    }

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

  // On Android, having both fontFamily and fontWeight can cause issues with custom fonts.
  // We remove fontWeight from the style object as it's already handled by the specific font family.
  const flattenStyle = StyleSheet.flatten(style);
  const { fontWeight, ...styleWithoutWeight } = flattenStyle || {};

  return (
    <Text
      {...rest}
      style={[
        {
          color,
          fontFamily: getFontFamily(),
          textAlign: isRTL ? "right" : "left",
        },
        Typography[type === "logo" ? "h1" : type] || Typography.body,
        styleWithoutWeight,
      ]}
    />
  );
}
