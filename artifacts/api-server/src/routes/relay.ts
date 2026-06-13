import { Router } from "express";

const router = Router();

interface RelayRequest {
  requestId: string;
  targetDeviceId: string;
  requesterId: string;
  type: "LIST" | "GET";
  path: string;
  createdAt: number;
}

interface RelayResult {
  data: string;
  error?: string;
  readyAt: number;
}

const pendingRequests = new Map<string, RelayRequest[]>();
const results = new Map<string, RelayResult>();

const cleanupOld = () => {
  const cutoff = Date.now() - 300000;
  for (const [id, result] of results.entries()) {
    if (result.readyAt < cutoff) results.delete(id);
  }
  for (const [deviceId, reqs] of pendingRequests.entries()) {
    const filtered = reqs.filter((r) => r.createdAt > cutoff);
    if (filtered.length === 0) pendingRequests.delete(deviceId);
    else pendingRequests.set(deviceId, filtered);
  }
};

setInterval(cleanupOld, 60000);

router.post("/relay/request", (req, res) => {
  const { requestId, targetDeviceId, requesterId, type, path } = req.body;
  if (!requestId || !targetDeviceId || !type || !path) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }
  const request: RelayRequest = {
    requestId,
    targetDeviceId,
    requesterId,
    type,
    path,
    createdAt: Date.now(),
  };
  const existing = pendingRequests.get(targetDeviceId) ?? [];
  existing.push(request);
  pendingRequests.set(targetDeviceId, existing);
  return res.json({ requestId, ok: true });
});

router.get("/relay/pending/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  const reqs = pendingRequests.get(deviceId) ?? [];
  pendingRequests.set(deviceId, []);
  return res.json({ requests: reqs });
});

router.post("/relay/respond", (req, res) => {
  const { requestId, data, error } = req.body;
  if (!requestId) {
    return res.status(400).json({ ok: false, error: "Missing requestId" });
  }
  results.set(requestId, { data: data ?? "", error, readyAt: Date.now() });
  return res.json({ ok: true });
});

router.get("/relay/result/:requestId", (req, res) => {
  const result = results.get(req.params.requestId);
  if (!result) {
    return res.json({ ready: false, data: "" });
  }
  return res.json({ ready: true, data: result.data, error: result.error });
});

export default router;
