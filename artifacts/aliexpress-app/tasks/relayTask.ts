import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const RELAY_TASK_NAME = "RELAY_HOST_TASK";

const RAILWAY_URL = "https://aliexpressfile.up.railway.app";

TaskManager.defineTask(RELAY_TASK_NAME, async () => {
  try {
    const [deviceId, unlocked] = await Promise.all([
      AsyncStorage.getItem("@device_id"),
      AsyncStorage.getItem("@unlocked"),
    ]);

    if (!deviceId || unlocked !== "true") {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await fetch(`${RAILWAY_URL}/api/devices/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        deviceName: `Device-${deviceId.slice(-4).toUpperCase()}`,
      }),
    });

    const pendingRes = await fetch(
      `${RAILWAY_URL}/api/relay/pending/${deviceId}`,
    );
    if (!pendingRes.ok) return BackgroundFetch.BackgroundFetchResult.Failed;

    const data = await pendingRes.json();
    const requests: Array<{
      requestId: string;
      type: "LIST" | "GET";
      path: string;
    }> = data.requests || [];

    if (requests.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const { listFilesForRelay, getFileBase64ForRelay } = await import(
      "../services/fileService"
    );

    for (const req of requests) {
      try {
        let responseData: string;
        if (req.type === "LIST") {
          const files = await listFilesForRelay(req.path);
          responseData = JSON.stringify(files);
        } else {
          responseData = await getFileBase64ForRelay(req.path);
        }
        await fetch(`${RAILWAY_URL}/api/relay/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: req.requestId, data: responseData }),
        });
      } catch (_e) {}
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (_e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerRelayTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(RELAY_TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(RELAY_TASK_NAME, {
        minimumInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (_e) {}
}

export async function unregisterRelayTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(RELAY_TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(RELAY_TASK_NAME);
    }
  } catch (_e) {}
}
