import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { Language, ThemeMode } from "@/context/AppContext";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    t,
    tryUnlock,
    isUnlocked,
    lock,
    profilePicture,
    saveProfilePicture,
    removeProfilePicture,
    deviceName,
  } = useApp();
  const [promoCode, setPromoCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSavePromo = () => {
    if (isUnlocked) {
      lock();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        t("Locked", "تم القفل"),
        t("Advanced mode deactivated.", "تم إلغاء تفعيل الوضع المتقدم."),
      );
      setPromoCode("");
      return;
    }
    const success = tryUnlock(promoCode);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else if (promoCode.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t("Invalid Code", "رمز غير صالح"),
        t("The code you entered is not valid.", "الرمز الذي أدخلته غير صالح."),
      );
    }
    setPromoCode("");
  };

  const handlePickImage = async () => {
    Alert.alert(
      t("Profile Picture", "الصورة الشخصية"),
      t("Choose an option", "اختر خياراً"),
      [
        {
          text: t("Camera", "الكاميرا"),
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert(
                t("Permission required", "يلزم الإذن"),
                t("Camera access is needed.", "يلزم الوصول إلى الكاميرا."),
              );
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              await saveProfilePicture(result.assets[0].uri);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
        {
          text: t("Gallery", "المعرض"),
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert(
                t("Permission required", "يلزم الإذن"),
                t("Photo library access is needed.", "يلزم الوصول إلى الصور."),
              );
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              await saveProfilePicture(result.assets[0].uri);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
        profilePicture
          ? {
              text: t("Remove Photo", "حذف الصورة"),
              style: "destructive" as const,
              onPress: async () => {
                await removeProfilePicture();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              },
            }
          : { text: t("Cancel", "إلغاء"), style: "cancel" as const },
        { text: t("Cancel", "إلغاء"), style: "cancel" as const },
      ],
    );
  };

  const langOptions: { value: Language; labelEn: string; labelAr: string }[] = [
    { value: "en", labelEn: "English", labelAr: "الإنجليزية" },
    { value: "ar", labelEn: "Arabic (العربية)", labelAr: "العربية" },
  ];

  const themeOptions: {
    value: ThemeMode;
    icon: string;
    labelEn: string;
    labelAr: string;
  }[] = [
    { value: "light", icon: "sun", labelEn: "Light", labelAr: "فاتح" },
    { value: "dark", icon: "moon", labelEn: "Dark", labelAr: "داكن" },
    { value: "system", icon: "smartphone", labelEn: "System", labelAr: "النظام" },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: insets.bottom + 32 },
    profileSection: {
      alignItems: "center",
      paddingTop: 28,
      paddingBottom: 20,
    },
    profileName: {
      marginTop: 12,
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    profileSub: {
      marginTop: 3,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    editPhotoBtn: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    editPhotoBtnText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
      marginVertical: 4,
    },
    section: { marginTop: 24, marginHorizontal: 16 },
    sectionTitle: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      marginLeft: 4,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    optionLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    selectedOption: { backgroundColor: colors.accent },
    selectedLabel: {
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    checkIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    promoInput: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      marginBottom: 10,
    },
    saveBtn: {
      backgroundColor: isUnlocked ? colors.destructive : colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
    },
    saveBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    successBanner: {
      backgroundColor: colors.success + "22",
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.success,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    successText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.success,
    },
    unlockedBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.success + "22",
      borderRadius: colors.radius,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.success,
    },
    unlockedText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.success,
      flex: 1,
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: t("Settings", "الإعدادات"),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* ─── Profile Picture ─── */}
        <View style={styles.profileSection}>
          <Avatar
            uri={profilePicture}
            size={90}
            onPress={handlePickImage}
            showEdit
            borderColor={colors.border}
          />
          <Text style={styles.profileName}>{deviceName}</Text>
          <Text style={styles.profileSub}>
            {t("Tap the photo to change it", "اضغط على الصورة لتغييرها")}
          </Text>
          <TouchableOpacity style={styles.editPhotoBtn} onPress={handlePickImage}>
            <Feather name="camera" size={14} color={colors.foreground} />
            <Text style={styles.editPhotoBtnText}>
              {profilePicture
                ? t("Change Photo", "تغيير الصورة")
                : t("Add Photo", "إضافة صورة")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ─── Language ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Language", "اللغة")}</Text>
          <View style={styles.sectionCard}>
            {langOptions.map((opt, idx) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionRow,
                  language === opt.value && styles.selectedOption,
                  idx === langOptions.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  setLanguage(opt.value);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.7}
              >
                <Feather
                  name="globe"
                  size={18}
                  color={language === opt.value ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    language === opt.value && styles.selectedLabel,
                  ]}
                >
                  {language === "ar" ? opt.labelAr : opt.labelEn}
                </Text>
                {language === opt.value && (
                  <View style={styles.checkIcon}>
                    <Feather name="check" size={13} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Appearance ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Appearance", "المظهر")}</Text>
          <View style={styles.sectionCard}>
            {themeOptions.map((opt, idx) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionRow,
                  themeMode === opt.value && styles.selectedOption,
                  idx === themeOptions.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  setThemeMode(opt.value);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.7}
              >
                <Feather
                  name={opt.icon as never}
                  size={18}
                  color={themeMode === opt.value ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    themeMode === opt.value && styles.selectedLabel,
                  ]}
                >
                  {language === "ar" ? opt.labelAr : opt.labelEn}
                </Text>
                {themeMode === opt.value && (
                  <View style={styles.checkIcon}>
                    <Feather name="check" size={13} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Promotional Code ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("Promotional Code", "رمز العرض الترويجي")}
          </Text>

          {showSuccess && (
            <View style={styles.successBanner}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.successText}>
                {t("Code applied successfully!", "تم تطبيق الرمز بنجاح!")}
              </Text>
            </View>
          )}

          {isUnlocked && (
            <View style={styles.unlockedBanner}>
              <Feather name="shield" size={16} color={colors.success} />
              <Text style={styles.unlockedText}>
                {t("Advanced mode active", "الوضع المتقدم مفعّل")}
              </Text>
            </View>
          )}

          {!isUnlocked && (
            <TextInput
              style={styles.promoInput}
              placeholder={t("Enter code here...", "أدخل الرمز هنا...")}
              placeholderTextColor={colors.mutedForeground}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSavePromo}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {isUnlocked ? t("Deactivate", "إلغاء التفعيل") : t("Save", "حفظ")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
