import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: number;
  mimeType?: string;
}

export function getMimeType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    aac: "audio/aac",
    flac: "audio/flac",
    ogg: "audio/ogg",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    apk: "application/vnd.android.package-archive",
  };
  return map[ext] || "application/octet-stream";
}

export function getFileCategory(
  mimeType: string,
): "image" | "video" | "audio" | "document" | "folder" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("text")
  )
    return "document";
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const getRootDirs = () => {
  const dirs = [
    { name: "Documents", path: FileSystem.documentDirectory ?? "" },
    { name: "Cache", path: FileSystem.cacheDirectory ?? "" },
  ];
  if (Platform.OS === "android") {
    dirs.push(
      { name: "DCIM", path: "file:///storage/emulated/0/DCIM/" },
      { name: "Pictures", path: "file:///storage/emulated/0/Pictures/" },
      { name: "Movies", path: "file:///storage/emulated/0/Movies/" },
      { name: "Music", path: "file:///storage/emulated/0/Music/" },
      { name: "Downloads", path: "file:///storage/emulated/0/Download/" },
    );
  }
  return dirs.filter((d) => d.path);
};

export async function listFilesForRelay(dirPath: string): Promise<FileEntry[]> {
  if (Platform.OS === "web") {
    return [
      {
        name: "Web mode — use mobile device",
        path: "/",
        isDirectory: false,
        size: 0,
        modifiedTime: Date.now(),
        mimeType: "text/plain",
      },
    ];
  }

  try {
    if (dirPath === "/" || dirPath === "" || dirPath === "root") {
      return getRootDirs().map((d) => ({
        name: d.name,
        path: d.path,
        isDirectory: true,
        size: 0,
        modifiedTime: Date.now(),
        mimeType: "inode/directory",
      }));
    }

    const decodedPath = decodeURIComponent(dirPath);
    const items = await FileSystem.readDirectoryAsync(decodedPath);
    const entries: FileEntry[] = [];

    await Promise.allSettled(
      items.map(async (name) => {
        const fullPath = decodedPath.endsWith("/")
          ? decodedPath + name
          : decodedPath + "/" + name;
        try {
          const info = await FileSystem.getInfoAsync(fullPath);
          const isDir = info.isDirectory ?? false;
          const mimeType = isDir ? "inode/directory" : getMimeType(name);
          entries.push({
            name,
            path: fullPath,
            isDirectory: isDir,
            size: (info as FileSystem.FileInfo & { size?: number }).size ?? 0,
            modifiedTime:
              (info as FileSystem.FileInfo & { modificationTime?: number })
                .modificationTime ?? Date.now(),
            mimeType,
          });
        } catch (_e) {
          // getInfoAsync fails on Android external storage due to scoped storage.
          // Determine isDirectory by attempting readDirectoryAsync — if it succeeds
          // the entry is a folder, otherwise it's a file.
          let isDir = false;
          try {
            await FileSystem.readDirectoryAsync(fullPath);
            isDir = true;
          } catch {
            isDir = false;
          }
          const mimeType = isDir ? "inode/directory" : getMimeType(name);
          entries.push({
            name,
            path: fullPath,
            isDirectory: isDir,
            size: 0,
            modifiedTime: Date.now(),
            mimeType,
          });
        }
      }),
    );

    entries.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return entries;
  } catch (_e) {
    return [];
  }
}

export async function getFileBase64ForRelay(filePath: string): Promise<string> {
  if (Platform.OS === "web") throw new Error("File access not available on web");
  const decodedPath = decodeURIComponent(filePath);
  const info = await FileSystem.getInfoAsync(decodedPath);
  const size = (info as FileSystem.FileInfo & { size?: number }).size ?? 0;
  if (size > 50 * 1024 * 1024) throw new Error("File too large (>50MB)");
  return FileSystem.readAsStringAsync(decodedPath, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function downloadFileFromBase64(
  base64: string,
  fileName: string,
): Promise<string> {
  if (Platform.OS === "web") throw new Error("Download not available on web");
  const dest = FileSystem.documentDirectory + "Downloads/";
  await FileSystem.makeDirectoryAsync(dest, { intermediates: true });
  const finalPath = dest + fileName;
  await FileSystem.writeAsStringAsync(finalPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return finalPath;
}
