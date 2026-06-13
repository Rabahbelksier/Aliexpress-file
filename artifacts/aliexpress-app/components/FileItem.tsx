import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatFileSize, getFileCategory } from "@/services/fileService";
import type { FileEntry } from "@/services/fileService";

interface FileItemProps {
  file: FileEntry;
  onPress: () => void;
  onLongPress?: () => void;
}

export function FileItem({ file, onPress, onLongPress }: FileItemProps) {
  const colors = useColors();

  const category = file.isDirectory ? "folder" : getFileCategory(file.mimeType ?? "");

  const iconConfig: Record<string, { name: string; color: string }> = {
    folder: { name: "folder", color: colors.fileFolder },
    image: { name: "image", color: colors.fileImage },
    video: { name: "film", color: colors.fileVideo },
    audio: { name: "music", color: colors.fileAudio },
    document: { name: "file-text", color: colors.fileDoc },
    other: { name: "file", color: colors.fileOther },
  };

  const icon = iconConfig[category] ?? iconConfig.other;

  const formattedDate = new Date(file.modifiedTime).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const styles = StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: icon.color + "1A",
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      flex: 1,
      gap: 3,
    },
    name: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    meta: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    chevron: {
      opacity: 0.4,
    },
  });

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <Feather name={icon.name as never} size={22} color={icon.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.meta}>
          {file.isDirectory ? "Folder" : formatFileSize(file.size)} · {formattedDate}
        </Text>
      </View>
      <Feather
        name={file.isDirectory ? "chevron-right" : "download"}
        size={18}
        color={colors.mutedForeground}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}
