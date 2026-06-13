# AliDeals — Network File Manager (Hidden)

A dual-purpose Android/iOS app built with Expo. Public face: AliExpress product promotions. Hidden face: Wi-Fi network file manager, activated by secret key.

## Run & Operate

- `pnpm --filter @workspace/aliexpress-app run dev` — run the Expo app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- Railway deployment domain: `aliexpressfile.up.railway.app`

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Mobile: Expo ~54, Expo Router, React Native
- API: Express 5 + in-memory device registry
- Relay: HTTP polling via Railway server
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/aliexpress-app/` — Expo mobile app
- `artifacts/aliexpress-app/app/` — Screens (tabs/index, settings, about, files/[deviceId], viewer)
- `artifacts/aliexpress-app/context/AppContext.tsx` — Global state (language, theme, unlock, devices)
- `artifacts/aliexpress-app/services/fileService.ts` — File system access + relay helpers
- `artifacts/aliexpress-app/data/products.ts` — Mock AliExpress products
- `artifacts/api-server/src/routes/devices.ts` — Device registry
- `artifacts/api-server/src/routes/relay.ts` — File relay endpoints
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `railway.json` + `nixpacks.toml` — Railway deployment config

## Architecture decisions

- **Dual-face UI**: App shows AliExpress products by default. Secret key `rabahapp4321` in Settings → "Promotional Code" unlocks file manager mode.
- **Railway relay**: Devices register themselves on Railway server. File browse requests are relayed through `/api/relay/request` → `/api/relay/pending/:deviceId` → `/api/relay/respond` polling loop.
- **Background hosting**: AppContext runs a setInterval polling loop when unlocked, acting as the host file server. Responds to incoming relay requests with actual file data from expo-file-system.
- **No real-time protocol**: Uses HTTP long-polling instead of WebSocket/Socket.io for maximum Expo Go compatibility.

## Product

- **Public mode**: Grid of AliExpress product cards with discounts, ratings, "Shop Now" buttons linking to AliExpress
- **Hidden file manager mode** (key required): Browse files on connected devices via Railway relay. View images, play video/audio, download files.
- Settings: Language (AR/EN), Theme (Light/Dark/System), Secret key input

## User preferences

- Arabic as default language
- AliExpress red (#FF4700) primary color theme
- Secret key: `rabahapp4321`

## Gotchas

- `expo-media-library` has no web support — guarded with Platform.OS checks
- expo-av deprecation warning in SDK 54 is safe to ignore (still works on Android)
- File access on Android 11+ requires MANAGE_EXTERNAL_STORAGE for full filesystem; app uses scoped storage paths that work without it
- Background polling via setInterval works when app is foregrounded; true Android background service requires bare workflow build

## Railway Deployment

See Railway Deployment Guide section below for step-by-step.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
