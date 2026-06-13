import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AliDeals</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f0f;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .logo { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 16px; color: #aaa; margin-bottom: 32px; }
    .btn {
      display: inline-block;
      background: #e60012;
      color: #fff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      width: 100%;
      max-width: 320px;
    }
    .note { font-size: 13px; color: #666; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="logo">🛍️</div>
  <h1>AliDeals</h1>
  <p>افتح التطبيق في Expo Go</p>
  <a class="btn" href="exp://aliexpressfile.up.railway.app">فتح في Expo Go</a>
  <p class="note">يجب تثبيت تطبيق Expo Go أولاً</p>
</body>
</html>`);
});

app.use("/api", router);

export default app;
