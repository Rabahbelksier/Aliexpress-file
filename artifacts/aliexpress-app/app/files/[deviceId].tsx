import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { FileItem } from "@/components/FileItem";
import type { FileEntry } from "@/services/fileService";

export default function FileBrowserScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, RAILWAY_URL, deviceId: myDeviceId } = useApp();
  const params = useLocalSearchParams<{
    deviceId: string;
    deviceName: string;
    currentPath?: string;
  }>();

  const targetDeviceId = params.deviceId;
  const isMyDevice = targetDeviceId === myDeviceId;
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(params.currentPath ?? "/");
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadFiles = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      if (isMyDevice) {
        const { listFilesForRelay } = await import("../../services/fileService");
        const entries = await listFilesForRelay(path);
        setFiles(entries);
        setLoading(false);
        return;
      }

      const requestId =
        "req_" + Date.now().toString(36) + Math.random().toString(36).substring(2);

      await fetch(`${RAILWAY_URL}/api/relay/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          targetDeviceId,
          requesterId: myDeviceId,
          type: "LIST",
          path: path,
        }),
      });

      let attempts = 0;
      let result: FileEntry[] | null = null;

      while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await fetch(`${RAILWAY_URL}/api/relay/result/${requestId}`);
        const data = await res.json();
        if (data.ready) {
          result = JSON.parse(data.data);
          break;
        }
        attempts++;
      }

      if (!result) throw new Error(t("Device did not respond", "لم يستجب الجهاز"));
      setFiles(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("Failed to load files", "فشل تحميل الملفات"));
    } finally {
      setLoading(false);
    }
  }, [targetDeviceId, RAILWAY_URL, myDeviceId, isMyDevice, t]);

  useEffect(() => {
    loadFiles(currentPath);
  }, []);

  const navigateToDir = (path: string) => {
    setPathStack((prev) => [...prev, currentPath]);
    setCurrentPath(path);
    loadFiles(path);
  };

  const goBack = () => {
    if (pathStack.length > 0) {
      const prev = pathStack[pathStack.length - 1];
      setPathStack((s) => s.slice(0, -1));
      setCurrentPath(prev);
      loadFiles(prev);
    } else {
      router.back();
    }
  };

  const handleFilePress = (file: FileEntry) => {
    if (file.isDirectory) {
      navigateToDir(file.path);
      return;
    }
    Haptics.selectionAsync();
    router.push({
      pathname: "/viewer",
      params: {
        deviceId: targetDeviceId,
        path: file.path,
        name: file.name,
        mimeType: file.mimeType ?? "",
        isLocal: isMyDevice ? "true" : "false",
      },
    });
  };

  const handleFileLongPress = (file: FileEntry) => {
    if (file.isDirectory) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      file.name,
      t("What do you want to do?", "ماذا تريد أن تفعل؟"),
      [
        {
          text: t("View", "عرض"),
          onPress: () => handleFilePress(file),
        },
        {
          text: t("Download to my device", "تنزيل إلى جهازي"),
          onPress: () => downloadFile(file),
        },
        { text: t("Cancel", "إلغاء"), style: "cancel" },
      ],
    );
  };

  const downloadFile = async (file: FileEntry) => {
    setDownloading(file.path);
    try {
      const requestId =
        "req_" + Date.now().toString(36) + Math.random().toString(36).substring(2);

      if (isMyDevice) {
        const { getFileBase64ForRelay, downloadFileFromBase64 } = await import("../../services/fileService");
        const base64 = await getFileBase64ForRelay(file.path);
        const dest = await downloadFileFromBase64(base64, file.name);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          t("Downloaded", "تم التنزيل"),
          t(`Saved: ${file.name}`, `تم الحفظ: ${file.name}`),
        );
        return;
      }

      await fetch(`${RAILWAY_URL}/api/relay/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          targetDeviceId,
          requesterId: myDeviceId,
          type: "GET",
          path: file.path,
        }),
      });

      let attempts = 0;
      let base64: string | null = null;
      while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await fetch(`${RAILWAY_URL}/api/relay/result/${requestId}`);
        const data = await res.json();
        if (data.ready) {
          base64 = data.data;
          break;
        }
        attempts++;
      }

      if (!base64) throw new Error("Timeout");

      const { downloadFileFromBase64 } = await import("../../services/fileService");
      await downloadFileFromBase64(base64, file.name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t("Downloaded", "تم التنزيل"),
        t(`File saved: ${file.name}`, `تم حفظ الملف: ${file.name}`),
      );
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("Error", "خطأ"), t("Download failed", "فشل التنزيل"));
    } finally {
      setDownloading(null);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    pathBar: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 4,
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 2,
    },
    backRowText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
      flex: 1,
    },
    pathText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    centerBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 32,
    },
    errorText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    retryBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    waitingMsg: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 8,
    },
  });

  const displayPath =
    currentPath === "/" || currentPath === "root"
      ? t("Root", "الجذر")
      : currentPath.split("/").pop() ?? currentPath;

  return (
    <>
      <Stack.Screen
        options={{
          title: params.deviceName ?? t("Files", "الملفات"),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={goBack}
              style={{ marginRight: 8 }}
            >
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => loadFiles(currentPath)}
              style={{ marginLeft: 8 }}
            >
              <Feather name="refresh-cw" size={18} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.pathBar}>
          {pathStack.length > 0 && (
            <TouchableOpacity
              onPress={goBack}
              style={styles.backRow}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={15} color={colors.primary} />
              <Text style={styles.backRowText} numberOfLines={1}>
                {pathStack.length > 0
                  ? (pathStack[pathStack.length - 1] === "/" || pathStack[pathStack.length - 1] === "root"
                      ? t("Root", "الجذر")
                      : (pathStack[pathStack.length - 1].split("/").pop() ?? t("Back", "رجوع")))
                  : t("Back", "رجوع")}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.pathText} numberOfLines={1}>
            📁 {displayPath}
          </Text>
        </View>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.waitingMsg}>
              {isMyDevice
                ? t("Reading files...", "جارٍ قراءة الملفات...")
                : t("Waiting for device response...", "جارٍ انتظار رد الجهاز...")}
            </Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerBox}>
            <Feather name="alert-circle" size={48} color={colors.destructive} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadFiles(currentPath)}
            >
              <Text style={styles.retryBtnText}>{t("Retry", "إعادة المحاولة")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && files.length === 0 && (
          <View style={styles.centerBox}>
            <Feather name="folder" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>{t("Empty folder", "مجلد فارغ")}</Text>
          </View>
        )}

        {!loading && !error && files.length > 0 && (
          <FlatList
            data={files}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => (
              <FileItem
                file={item}
                onPress={() => handleFilePress(item)}
                onLongPress={() => handleFileLongPress(item)}
              />
            )}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {downloading && (
          <View
            style={{
              position: "absolute",
              bottom: insets.bottom + 16,
              left: 16,
              right: 16,
              backgroundColor: colors.card,
              borderRadius: colors.radius,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground, flex: 1 }}>
              {t("Downloading file...", "جارٍ تنزيل الملف...")}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
