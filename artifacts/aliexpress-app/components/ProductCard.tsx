import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  width: number;
}

export function ProductCard({ product, width }: ProductCardProps) {
  const colors = useColors();
  const { language, t } = useApp();

  const openProduct = async () => {
    await WebBrowser.openBrowserAsync(product.url);
  };

  const name = language === "ar" ? product.nameAr : product.name;
  const category = language === "ar" ? product.categoryAr : product.category;

  const styles = StyleSheet.create({
    card: {
      width,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: "hidden",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    imageContainer: {
      width: "100%",
      aspectRatio: 3 / 4,
      backgroundColor: colors.muted,
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    discountBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: colors.primary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    discountText: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    body: {
      padding: 10,
    },
    category: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    name: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 6,
      lineHeight: 18,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 6,
      marginBottom: 6,
    },
    price: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    originalPrice: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textDecorationLine: "line-through",
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 8,
    },
    stars: {
      flexDirection: "row",
      gap: 1,
    },
    ratingText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    buyButton: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius / 2,
      paddingVertical: 8,
      alignItems: "center",
    },
    buyButtonText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
  });

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(product.rating);
    return filled;
  });

  return (
    <TouchableOpacity style={styles.card} onPress={openProduct} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={product.image as never}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discount}%</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.originalPrice}>{product.originalPrice}</Text>
        </View>
        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {stars.map((filled, i) => (
              <Feather
                key={i}
                name="star"
                size={11}
                color={filled ? colors.star : colors.mutedForeground}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            ({product.reviews.toLocaleString()}) · {product.sold} {t("sold", "مباع")}
          </Text>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={openProduct} activeOpacity={0.8}>
          <Text style={styles.buyButtonText}>{t("Shop Now", "تسوق الآن")}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
