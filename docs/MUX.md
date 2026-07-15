# Mux Video integration — placeholder

Online course lessons store Mux IDs in Firestore. The browser must **not** hold Mux API secrets.

## Env

```bash
# Your backend that mints signed playback tokens / handles uploads
VITE_MUX_API_URL=https://your-mux-server.example.com
```

Client helpers: `src/lib/mux.ts`.

## Firestore lesson fields

| Field | Meaning |
|-------|---------|
| `muxAssetId` | Mux Asset ID after upload |
| `muxPlaybackId` | Mux Playback ID used for HLS (`https://stream.mux.com/{id}.m3u8`) |

Until live, CMS sets `muxPlaybackId` to `PLACEHOLDER`. The player shows a placeholder UI instead of embedding video.

## Recommended upload flow (admin / backend)

1. Admin requests an upload URL from your API (`POST /mux/upload`).
2. API uses Mux Direct Upload with secret credentials; returns `uploadUrl` + `uploadId`.
3. Client (or CMS) uploads the file to Mux.
4. Mux webhook `video.asset.ready` → your server writes `muxAssetId` + `muxPlaybackId` onto the lesson in Firestore.

## Playback flow (student)

1. Student owns the course (`userEntitlements/{uid}/courses/{courseId}`).
2. Player requests a signed token: `POST {VITE_MUX_API_URL}/playback-token` with `{ playbackId, uid }`.
3. Server verifies entitlement, then signs a Mux JWT (if using signed playback).
4. Frontend plays HLS via Mux Player or `hls.js`:

```ts
import { getMuxHlsUrl } from '../lib/mux';

const url = getMuxHlsUrl(playbackId, token);
// <mux-player playback-id={playbackId} tokens-playback={token} />
```

Suggested package when ready: `@mux/mux-player-react`.

## Security

- Use **signed playback** policies for paid content.
- Always re-check entitlement on the token endpoint.
- Do not expose `MUX_TOKEN_SECRET` or `MUX_TOKEN_ID` to Vite.

## Checklist

- [ ] Mux environment + signing keys on the server
- [ ] Direct upload + asset-ready webhook
- [ ] Playback-token endpoint with entitlement check
- [ ] Replace placeholder UI in `OnlineCoursePlayer.tsx` with `<MuxPlayer />`
- [ ] CMS lesson fields filled with real playback IDs
