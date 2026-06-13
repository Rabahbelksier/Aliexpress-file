import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { DrawerMenu } from "@/components/DrawerMenu";
import { ProductCard } from "@/components/ProductCard";
import { useApp } from "@/context/AppContext";
import { PRODUCTS } from "@/data/products";
import { useColors } from "@/hooks/useColors";
import type { RemoteDevice } from "@/context/AppContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * 3) / 2;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isUnlocked, devices, refreshDevices, t, isHosting, deviceId, profilePicture } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isUnlocked) await refreshDevices();
    setRefreshing(false);
  }, [isUnlocked, refreshDevices]);

  useEffect(() => {
    if (isUnlocked) refreshDevices();
  }, [isUnlocked]);

  const openDevice = (device: RemoteDevice) => {
    Haptics.selectionAsync();
    router.push({
      pathname: "/files/[deviceId]",
      params: { deviceId: device.deviceId, deviceName: device.deviceName },
    });
  };

  const openMyFiles = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: "/files/[deviceId]",
      params: { deviceId: deviceId, deviceName: t("My Device", "جهازي") },
    });
  };

  const topPadding = insets.top + (Platform.OS === "web" ? 20 : 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: topPadding,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    menuBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    hostingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    hostingDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: "#4CAF50",
    },
    hostingText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: "#FFFFFF",
    },
    searchBar: {
      marginTop: 12,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    searchPlaceholder: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
    },
    promoBar: {
      backgroundColor: "#E63F00",
      paddingHorizontal: 16,
      paddingVertical: 9,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    promoText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "#FFFFFF",
      flex: 1,
    },
    sectionHeader: {
      paddingHorizontal: 12,
      paddingTop: 16,
      paddingBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    sectionSubtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    productRow: {
      paddingHorizontal: CARD_MARGIN,
      gap: CARD_MARGIN,
      flexDirection: "row",
    },
    deviceCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    deviceIconBox: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    deviceInfo: {
      flex: 1,
    },
    deviceName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 3,
    },
    onlineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#4CAF50",
    },
    onlineText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#4CAF50",
    },
    myDeviceBorder: {
      borderColor: colors.primary + "40",
      backgroundColor: colors.primary + "08",
    },
    centerBox: {
      paddingTop: 48,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
    },
    refreshBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
    },
    refreshBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
  });

  if (isUnlocked) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => setDrawerOpen(true)}
            >
              <Feather name="menu" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t("Network Files", "ملفات الشبكة")}
            </Text>
            {isHosting && (
              <View style={styles.hostingBadge}>
                <View style={styles.hostingDot} />
                <Text style={styles.hostingText}>{t("Active", "نشط")}</Text>
              </View>
            )}
            <Avatar uri={profilePicture} size={34} />
          </View>
        </View>

        <FlatList
          data={devices}
          keyExtractor={(d) => d.deviceId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t("My Device", "جهازي")}</Text>
              </View>
              <TouchableOpacity
                style={[styles.deviceCard, styles.myDeviceBorder]}
                onPress={openMyFiles}
                activeOpacity={0.8}
              >
                <View style={styles.deviceIconBox}>
                  <Feather name="smartphone" size={24} color={colors.primary} />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{t("This Device", "هذا الجهاز")}</Text>
                  <View style={styles.onlineRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>{t("Browse my files", "تصفح ملفاتي")}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("Connected Devices", "الأجهزة المتصلة")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {devices.length} {t("online", "متصل")}
                </Text>
              </View>

              {devices.length === 0 && (
                <View style={styles.centerBox}>
                  <Feather name="wifi" size={52} color={colors.mutedForeground} />
                  <Text style={styles.emptyTitle}>
                    {t("No devices found", "لا توجد أجهزة")}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {t(
                      "Install the app on other devices. They will appear here automatically.",
                      "قم بتثبيت التطبيق على أجهزة أخرى. ستظهر هنا تلقائياً.",
                    )}
                  </Text>
                  <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                    <Feather name="refresh-cw" size={16} color="#FFFFFF" />
                    <Text style={styles.refreshBtnText}>{t("Refresh", "تحديث")}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceCard}
              onPress={() => openDevice(item)}
              activeOpacity={0.8}
            >
              <View style={styles.deviceIconBox}>
                <Feather name="monitor" size={24} color={colors.primary} />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.deviceName}</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>{t("Online", "متصل")}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        />

        <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setDrawerOpen(true)}
          >
            <Feather name="menu" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AliDeals</Text>
          <Avatar uri={profilePicture} size={34} />
        </View>
        <TouchableOpacity style={styles.searchBar}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.searchPlaceholder}>
            {t("Search products...", "ابحث عن منتجات...")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promoBar}>
        <Feather name="zap" size={14} color="#FFFFFF" />
        <Text style={styles.promoText}>
          {t(
            "Flash Sale: Up to 70% OFF — Limited time!",
            "تخفيض سريع: حتى 70% خصم — وقت محدود!",
          )}
        </Text>
      </View>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("Today's Deals", "عروض اليوم")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {PRODUCTS.length} {t("products", "منتج")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} width={CARD_WIDTH} />
        )}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          paddingTop: 4,
        }}
        showsVerticalScrollIndicator={false}
      />

      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}
