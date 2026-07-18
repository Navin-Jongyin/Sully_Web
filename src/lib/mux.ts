/**
 * Mux Video helpers — PLACEHOLDER
 *
 * Do not put Mux secrets in the browser. Playback tokens and uploads
 * must go through your backend. See docs/MUX.md.
 */

export interface MuxPlaybackInfo {
  playbackId: string;
  /** Signed JWT token when using signed playback policies */
  token?: string;
}

/**
 * Builds an HLS playback URL for a Mux playback ID.
 * When using signed URLs, pass a token from your backend.
 */
export function getMuxHlsUrl(playbackId: string, token?: string): string {
  const base = `https://stream.mux.com/${playbackId}.m3u8`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

/**
 * Placeholder: fetch a signed playback token from your API.
 * Implement this once the Mux backend service exists.
 */
export async function fetchMuxPlaybackToken(
  playbackId: string,
  uid: string,
): Promise<string> {
  const base = import.meta.env.VITE_MUX_API_URL as string | undefined;
  if (!base) {
    throw new Error(
      'Mux service not configured. Set VITE_MUX_API_URL. See docs/MUX.md.',
    );
  }

  const res = await fetch(`${base.replace(/\/$/, '')}/playback-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playbackId, uid }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get Mux playback token (${res.status})`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

/** True when a lesson has a Mux playback ID ready for streaming. */
export function lessonHasVideo(playbackId?: string): boolean {
  return Boolean(playbackId && playbackId !== 'PLACEHOLDER' && !playbackId.startsWith('pending-'));
}
