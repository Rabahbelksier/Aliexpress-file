import { Feather } from "@expo/vector-icons";
import { Audio, Video, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { downloadFileFromBase64, formatFileSize } from "@/services/fileService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ViewerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, RAILWAY_URL } = useApp();
  const params = useLocalSearchParams<{
    deviceId: string;
    path: string;
    name: string;
    mimeType: string;
    isLocal?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStatus, setAudioStatus] = useState({ position: 0, duration: 0 });

  const mimeType = params.mimeType ?? "";
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");
  const isLocal = params.isLocal === "true";

  const loadFile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isLocal) {
        setLocalUri(params.path);
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
          targetDeviceId: params.deviceId,
          requesterId: "viewer",
          type: "GET",
          path: params.path,
        }),
      });

      let attempts = 0;
      let base64: string | null = null;
      while (attempts < 20) {
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

      const savedPath = await downloadFileFromBase64(base64, params.name);
      setLocalUri(savedPath);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load file");
    } finally {
      setLoading(false);
    }
  }, [params.deviceId, params.path, params.name, isLocal, RAILWAY_URL]);

  useEffect(() => {
    loadFile();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handleDownload = async () => {
    if (!localUri) return;
    setDownloading(true);
    try {
      const dest = FileSystem.documentDirectory + "Downloads/";
      await FileSystem.makeDirectoryAsync(dest, { intermediates: true });
      const finalPath = dest + params.name;
      await FileSystem.copyAsync({ from: localUri, to: finalPath });
      setDownloaded(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t("Downloaded", "تم التنزيل"),
        t(`Saved to Downloads/${params.name}`, `تم الحفظ في التنزيلات/${params.name}`),
      );
    } catch {
      Alert.alert(t("Error", "خطأ"), t("Download failed", "فشل التنزيل"));
    } finally {
      setDownloading(false);
    }
  };

  const toggleAudio = async () => {
    if (!localUri) return;
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
      return;
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: localUri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying ?? false);
          setAudioStatus({
            position: status.positionMillis ?? 0,
            duration: status.durationMillis ?? 0,
          });
        }
      },
    );
    soundRef.current = sound;
    setIsPlaying(true);
  };

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
    },
    centerBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    errorText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "#AAAAAA",
      textAlign: "center",
      paddingHorizontal: 32,
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
    image: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      resizeMode: "contain",
    },
    video: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT * 0.6,
    },
    audioCard: {
      flex: 1,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      padding: 32,
    },
    audioTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      textAlign: "center",
    },
    audioIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    playBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    audioTime: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    bottomBar: {
      position: "absolute",
      bottom: insets.bottom + 16,
      left: 16,
      right: 16,
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    actionBtn: {
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionBtnText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "#FFFFFF",
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: params.name ?? "File",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#FFF",
          headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
        }}
      />
      <View style={styles.container}>
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.errorText}>{t("Loading...", "جارٍ التحميل...")}</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerBox}>
            <Feather name="alert-circle" size={48} color="#666" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadFile}>
              <Text style={styles.retryBtnText}>{t("Retry", "إعادة المحاولة")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && localUri && (
          <>
            {isImage && (
              <ScrollView
                maximumZoomScale={4}
                minimumZoomScale={1}
                contentContainerStyle={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <Image source={{ uri: localUri }} style={styles.image} />
              </ScrollView>
            )}

            {isVideo && (
              <Video
                source={{ uri: localUri }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
              />
            )}

            {isAudio && (
              <View style={styles.audioCard}>
                <View style={styles.audioIcon}>
                  <Feather name="music" size={60} color={colors.primary} />
                </View>
                <Text style={styles.audioTitle}>{params.name}</Text>
                <TouchableOpacity style={styles.playBtn} onPress={toggleAudio}>
                  <Feather name={isPlaying ? "pause" : "play"} size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.audioTime}>
                  {formatTime(audioStatus.position)} / {formatTime(audioStatus.duration)}
                </Text>
              </View>
            )}

            {!isImage && !isVideo && !isAudio && (
              <View style={styles.centerBox}>
                <Feather name="file" size={64} color="#666" />
                <Text style={styles.errorText}>{params.name}</Text>
                <Text style={styles.errorText}>
                  {t("This file type cannot be previewed", "لا يمكن معاينة هذا النوع من الملفات")}
                </Text>
              </View>
            )}

            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleDownload}
                disabled={downloading || downloaded}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Feather
                    name={downloaded ? "check" : "download"}
                    size={16}
                    color="#FFF"
                  />
                )}
                <Text style={styles.actionBtnText}>
                  {downloaded
                    ? t("Saved", "محفوظ")
                    : downloading
                      ? t("Saving...", "جارٍ الحفظ...")
                      : t("Download", "تنزيل")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
}
