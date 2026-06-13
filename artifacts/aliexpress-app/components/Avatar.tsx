import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface AvatarProps {
  uri: string | null;
  size?: number;
  onPress?: () => void;
  showEdit?: boolean;
  borderColor?: string;
}

export function Avatar({
  uri,
  size = 44,
  onPress,
  showEdit = false,
  borderColor = "rgba(255,255,255,0.4)",
}: AvatarProps) {
  const radius = size / 2;
  const editSize = Math.round(size * 0.35);

  const inner = uri ? (
    <Image
      source={{ uri }}
      style={[styles.img, { width: size, height: size, borderRadius: radius }]}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor,
        },
      ]}
    >
      <Feather name="user" size={size * 0.45} color="rgba(255,255,255,0.85)" />
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={{ position: "relative" }}
      disabled={!onPress}
    >
      {inner}
      {showEdit && (
        <View
          style={[
            styles.editBadge,
            {
              width: editSize,
              height: editSize,
              borderRadius: editSize / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        >
          <Feather name="camera" size={editSize * 0.55} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  img: {
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    backgroundColor: "#FF4700",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});
