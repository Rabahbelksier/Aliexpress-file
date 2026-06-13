import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useApp();

  const features = [
    {
      icon: "shopping-bag",
      en: "Browse thousands of products from AliExpress at the best prices",
      ar: "تصفح آلاف المنتجات من علي إكسبريس بأفضل الأسعار",
    },
    {
      icon: "tag",
      en: "Exclusive deals and discounts updated daily",
      ar: "عروض وتخفيضات حصرية تُحدَّث يومياً",
    },
    {
      icon: "star",
      en: "Curated top-rated products with verified reviews",
      ar: "منتجات مختارة بتقييمات عالية ومراجعات موثقة",
    },
    {
      icon: "zap",
      en: "Fast browsing with optimized shopping experience",
      ar: "تصفح سريع مع تجربة تسوق محسّنة",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    heroSection: {
      backgroundColor: colors.primary,
      alignItems: "center",
      paddingTop: 40,
      paddingBottom: 40,
      paddingHorizontal: 24,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginBottom: 6,
    },
    appVersion: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.8)",
      marginBottom: 12,
    },
    tagline: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.9)",
      textAlign: "center",
      lineHeight: 22,
    },
    content: {
      paddingBottom: insets.bottom + 32,
    },
    section: {
      margin: 16,
      marginBottom: 0,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
      marginLeft: 4,
    },
    featureCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featureIconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    featureText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      flex: 1,
      lineHeight: 20,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    infoLabel: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    infoValue: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    disclaimer: {
      margin: 16,
      padding: 14,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
    },
    disclaimerText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 18,
      textAlign: "center",
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: t("About", "حول التطبيق"),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Feather name="shopping-bag" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>AliDeals</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.tagline}>
            {t(
              "Your gateway to amazing deals from AliExpress. Discover products at unbeatable prices.",
              "بوابتك لأفضل عروض علي إكسبريس. اكتشف منتجات بأسعار لا تُضاهى.",
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Features", "المميزات")}</Text>
          {features.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Feather name={f.icon as never} size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{t(f.en, f.ar)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("App Info", "معلومات التطبيق")}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="code" size={16} color={colors.mutedForeground} />
              <Text style={styles.infoLabel}>{t("Version", "الإصدار")}</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="layers" size={16} color={colors.mutedForeground} />
              <Text style={styles.infoLabel}>{t("Platform", "المنصة")}</Text>
              <Text style={styles.infoValue}>Android / iOS</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Feather name="heart" size={16} color={colors.mutedForeground} />
              <Text style={styles.infoLabel}>{t("Built with", "مبني بـ")}</Text>
              <Text style={styles.infoValue}>React Native + Expo</Text>
            </View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {t(
              "AliDeals is an affiliate promotion app. We are not affiliated with Alibaba Group or AliExpress. All products and prices are sourced from the AliExpress platform.",
              "AliDeals تطبيق ترويجي تابع. نحن لسنا تابعين لمجموعة علي بابا أو علي إكسبريس. جميع المنتجات والأسعار مصدرها منصة علي إكسبريس.",
            )}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
