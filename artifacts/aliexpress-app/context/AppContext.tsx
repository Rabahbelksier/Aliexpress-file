import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PermissionsAndroid, Platform, useColorScheme } from "react-native";
import { registerRelayTask, unregisterRelayTask } from "@/tasks/relayTask";

type NotificationsModule = typeof import("expo-notifications");
function getNotifications(): NotificationsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as NotificationsModule;
  } catch (_e) {
    return null;
  }
}

async function requestStoragePermissions() {
  if (Platform.OS !== "android") return true;
  try {
    const sdkVersion = Platform.Version as number;
    if (sdkVersion >= 33) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      ]);
      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED,
      );
    } else {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return Object.values(result).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED,
      );
    }
  } catch (_e) {
    return false;
  }
}

const RAILWAY_URL = "https://aliexpressfile.up.railway.app";
const SECRET_KEY = "rabahapp4321";
const DEVICE_ID_KEY = "@device_id";
const UNLOCKED_KEY = "@unlocked";
const LANGUAGE_KEY = "@language";
const THEME_KEY = "@theme";
const PROFILE_PIC_KEY = "@profile_picture";

export type Language = "ar" | "en";
export type ThemeMode = "light" | "dark" | "system";

export interface RemoteDevice {
  deviceId: string;
  deviceName: string;
  lastSeen: number;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: number;
  mimeType?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
  isUnlocked: boolean;
  tryUnlock: (key: string) => boolean;
  lock: () => void;
  deviceId: string;
  deviceName: string;
  devices: RemoteDevice[];
  refreshDevices: () => Promise<void>;
  isHosting: boolean;
  t: (en: string, ar: string) => string;
  RAILWAY_URL: string;
  profilePicture: string | null;
  saveProfilePicture: (uri: string) => Promise<void>;
  removeProfilePicture: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>("ar");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("My Device");
  const [devices, setDevices] = useState<RemoteDevice[]>([]);
  const [isHosting, setIsHosting] = useState(false);
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);
  const hostIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolvedTheme: "light" | "dark" =
    themeMode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const t = useCallback(
    (en: string, ar: string) => (language === "ar" ? ar : en),
    [language],
  );

  useEffect(() => {
    (async () => {
      const [storedId, storedUnlocked, storedLang, storedTheme, storedPic] =
        await Promise.all([
          AsyncStorage.getItem(DEVICE_ID_KEY),
          AsyncStorage.getItem(UNLOCKED_KEY),
          AsyncStorage.getItem(LANGUAGE_KEY),
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(PROFILE_PIC_KEY),
        ]);

      let id = storedId;
      if (!id) {
        id =
          "dev_" +
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 7);
        await AsyncStorage.setItem(DEVICE_ID_KEY, id);
      }
      setDeviceId(id);

      if (storedUnlocked === "true") {
        setIsUnlocked(true);
        requestStoragePermissions();
        registerRelayTask();
      }
      if (storedLang) setLanguageState(storedLang as Language);
      if (storedTheme) setThemeModeState(storedTheme as ThemeMode);
      if (storedPic) {
        if (Platform.OS === "web") {
          setProfilePictureState(storedPic);
        } else {
          const info = await FileSystem.getInfoAsync(storedPic);
          if (info.exists) setProfilePictureState(storedPic);
        }
      }

      const namePlatform =
        Platform.OS === "android"
          ? "Android"
          : Platform.OS === "ios"
            ? "iPhone"
            : "Device";
      setDeviceName(`${namePlatform}-${id.slice(-4).toUpperCase()}`);
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const saveProfilePicture = useCallback(async (sourceUri: string) => {
    try {
      const dest = (FileSystem.documentDirectory ?? "") + "profile.jpg";
      if (Platform.OS !== "web") {
        await FileSystem.copyAsync({ from: sourceUri, to: dest });
        setProfilePictureState(dest);
        await AsyncStorage.setItem(PROFILE_PIC_KEY, dest);
      } else {
        setProfilePictureState(sourceUri);
        await AsyncStorage.setItem(PROFILE_PIC_KEY, sourceUri);
      }
    } catch (_e) {}
  }, []);

  const removeProfilePicture = useCallback(async () => {
    try {
      if (profilePicture && Platform.OS !== "web") {
        const info = await FileSystem.getInfoAsync(profilePicture);
        if (info.exists) await FileSystem.deleteAsync(profilePicture);
      }
    } catch (_e) {}
    setProfilePictureState(null);
    await AsyncStorage.removeItem(PROFILE_PIC_KEY);
  }, [profilePicture]);

  const startForegroundService = useCallback(async () => {
    if (Platform.OS !== "android") return;
    const Notifs = getNotifications();
    if (!Notifs) return;
    try {
      await Notifs.requestPermissionsAsync();
      await Notifs.setNotificationChannelAsync("relay-service", {
        name: "AliDeals Service",
        importance: Notifs.AndroidImportance.LOW,
        showBadge: false,
      });
      await Notifs.scheduleNotificationAsync({
        identifier: "relay-foreground",
        content: {
          title: "AliDeals",
          body: "خدمة مشاركة الملفات تعمل في الخلفية",
          sticky: true,
          autoDismiss: false,
          data: { foregroundService: true },
        },
        trigger: null,
      });
    } catch (_e) {}
  }, []);

  const stopForegroundService = useCallback(async () => {
    if (Platform.OS !== "android") return;
    const Notifs = getNotifications();
    if (!Notifs) return;
    try {
      await Notifs.dismissNotificationAsync("relay-foreground");
    } catch (_e) {}
  }, []);

  const tryUnlock = useCallback((key: string) => {
    if (key.trim() === SECRET_KEY) {
      setIsUnlocked(true);
      AsyncStorage.setItem(UNLOCKED_KEY, "true");
      requestStoragePermissions();
      registerRelayTask();
      startForegroundService();
      return true;
    }
    return false;
  }, [startForegroundService]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    AsyncStorage.setItem(UNLOCKED_KEY, "false");
    unregisterRelayTask();
    stopForegroundService();
  }, [stopForegroundService]);

  const refreshDevices = useCallback(async () => {
    try {
      const res = await fetch(`${RAILWAY_URL}/api/devices`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const now = Date.now();
        const active = (data.devices as RemoteDevice[]).filter(
          (d) => d.deviceId !== deviceId && now - d.lastSeen < 60000,
        );
        setDevices(active);
      }
    } catch (_e) {
    }
  }, [deviceId]);

  const registerDevice = useCallback(async () => {
    if (!deviceId || !deviceName) return;
    try {
      await fetch(`${RAILWAY_URL}/api/devices/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, deviceName }),
      });
    } catch (_e) {
    }
  }, [deviceId, deviceName]);

  useEffect(() => {
    if (!deviceId || !isUnlocked) return;

    registerDevice();
    refreshDevices();

    const interval = setInterval(() => {
      registerDevice();
      refreshDevices();
    }, 15000);

    return () => clearInterval(interval);
  }, [deviceId, isUnlocked, registerDevice, refreshDevices]);

  useEffect(() => {
    if (!deviceId || !isUnlocked) {
      if (hostIntervalRef.current) {
        clearInterval(hostIntervalRef.current);
        hostIntervalRef.current = null;
        setIsHosting(false);
      }
      return;
    }

    setIsHosting(true);

    const processRequests = async () => {
      try {
        const res = await fetch(
          `${RAILWAY_URL}/api/relay/pending/${deviceId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const requests: Array<{
          requestId: string;
          type: "LIST" | "GET";
          path: string;
          requesterId: string;
        }> = data.requests || [];

        for (const req of requests) {
          if (req.type === "LIST") {
            const { listFilesForRelay } = await import("../services/fileService");
            const files = await listFilesForRelay(req.path);
            await fetch(`${RAILWAY_URL}/api/relay/respond`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                requestId: req.requestId,
                data: JSON.stringify(files),
              }),
            });
          } else if (req.type === "GET") {
            const { getFileBase64ForRelay } = await import("../services/fileService");
            const base64 = await getFileBase64ForRelay(req.path);
            await fetch(`${RAILWAY_URL}/api/relay/respond`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                requestId: req.requestId,
                data: base64,
              }),
            });
          }
        }
      } catch (_e) {
      }
    };

    hostIntervalRef.current = setInterval(processRequests, 5000);
    processRequests();

    return () => {
      if (hostIntervalRef.current) {
        clearInterval(hostIntervalRef.current);
        hostIntervalRef.current = null;
      }
      setIsHosting(false);
    };
  }, [deviceId, isUnlocked]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        themeMode,
        setThemeMode,
        resolvedTheme,
        isUnlocked,
        tryUnlock,
        lock,
        deviceId,
        deviceName,
        devices,
        refreshDevices,
        isHosting,
        t,
        RAILWAY_URL,
        profilePicture,
        saveProfilePicture,
        removeProfilePicture,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
