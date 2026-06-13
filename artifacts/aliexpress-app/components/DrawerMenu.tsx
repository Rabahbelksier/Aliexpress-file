import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const DRAWER_WIDTH = 280;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, isUnlocked, language } = useApp();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const isRTL = language === "ar";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -DRAWER_WIDTH,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: isOpen ? 0.5 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const navigate = (path: string) => {
    onClose();
    setTimeout(() => router.push(path as never), 100);
  };

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      pointerEvents: isOpen ? "auto" : "none",
    } as never,
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#000",
    },
    drawer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: DRAWER_WIDTH,
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 20,
    },
    header: {
      paddingTop: insets.top + 20,
      paddingBottom: 24,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
    },
    appName: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginTop: 12,
    },
    appTagline: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.8)",
      marginTop: 4,
    },
    logoCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    menuItems: {
      paddingTop: 12,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 14,
    },
    menuItemText: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
      marginVertical: 4,
    },
    versionText: {
      position: "absolute",
      bottom: insets.bottom + 16,
      left: 20,
      right: 20,
      textAlign: "center",
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Feather name="shopping-bag" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>
            {isUnlocked ? t("FileShare", "مشاركة الملفات") : "AliDeals"}
          </Text>
          <Text style={styles.appTagline}>
            {isUnlocked
              ? t("Network File Manager", "مدير ملفات الشبكة")
              : t("Best deals from AliExpress", "أفضل عروض علي إكسبريس")}
          </Text>
        </View>

        <View style={styles.menuItems}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigate("/(tabs)/")}
            activeOpacity={0.7}
          >
            <Feather name="home" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>
              {t("Home", "الرئيسية")}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigate("/settings")}
            activeOpacity={0.7}
          >
            <Feather name="settings" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>
              {t("Settings", "الإعدادات")}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigate("/about")}
            activeOpacity={0.7}
          >
            <Feather name="info" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>
              {t("About", "حول التطبيق")}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>v1.0.0 • AliDeals</Text>
      </Animated.View>
    </View>
  );
}
