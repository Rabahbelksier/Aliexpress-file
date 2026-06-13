import { Router } from "express";

const router = Router();

interface Device {
  deviceId: string;
  deviceName: string;
  lastSeen: number;
}

const deviceRegistry = new Map<string, Device>();

const cleanup = () => {
  const now = Date.now();
  for (const [id, device] of deviceRegistry.entries()) {
    if (now - device.lastSeen > 120000) {
      deviceRegistry.delete(id);
    }
  }
};

setInterval(cleanup, 30000);

router.post("/devices/register", (req, res) => {
  const { deviceId, deviceName } = req.body;
  if (!deviceId || !deviceName) {
    return res.status(400).json({ ok: false, error: "Missing deviceId or deviceName" });
  }
  deviceRegistry.set(deviceId, { deviceId, deviceName, lastSeen: Date.now() });
  return res.json({ ok: true });
});

router.get("/devices", (_req, res) => {
  cleanup();
  const devices = Array.from(deviceRegistry.values());
  return res.json({ devices });
});

router.delete("/devices/:deviceId/unregister", (req, res) => {
  deviceRegistry.delete(req.params.deviceId);
  return res.json({ ok: true });
});

export default router;
