import { getMuxHlsUrl } from './mux';
import type { OnlineCourseLesson, VideoProvider } from '../commerce/types';

export interface ResolvedVideoSource {
  kind: 'native' | 'hls' | 'iframe' | 'none';
  url?: string;
  provider: VideoProvider;
}

function safeUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol === 'https:') return url;
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) return url;
    return null;
  } catch {
    return null;
  }
}

export function resolveVideoSource(lesson?: OnlineCourseLesson): ResolvedVideoSource {
  if (!lesson) return { kind: 'none', provider: 'auto' };
  if (!lesson.videoUrl && lesson.muxPlaybackId && lesson.muxPlaybackId !== 'PLACEHOLDER') {
    return { kind: 'hls', provider: 'mux', url: getMuxHlsUrl(lesson.muxPlaybackId) };
  }

  const parsed = safeUrl(lesson.videoUrl ?? '');
  if (!parsed) return { kind: 'none', provider: lesson.videoProvider ?? 'auto' };
  const requested = lesson.videoProvider ?? 'auto';
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  if (requested === 'youtube' || host === 'youtu.be' || host.endsWith('youtube.com')) {
    const id = host === 'youtu.be'
      ? path.split('/').filter(Boolean)[0]
      : parsed.searchParams.get('v') ?? path.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
    return id
      ? { kind: 'iframe', provider: 'youtube', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` }
      : { kind: 'none', provider: 'youtube' };
  }

  if (requested === 'vimeo' || host.endsWith('vimeo.com')) {
    const id = path.match(/\/(?:video\/)?(\d+)/)?.[1];
    return id
      ? { kind: 'iframe', provider: 'vimeo', url: `https://player.vimeo.com/video/${id}` }
      : { kind: 'none', provider: 'vimeo' };
  }

  if (requested === 'direct' || /\.(mp4|webm|ogg)$/i.test(path)) {
    return { kind: 'native', provider: 'direct', url: parsed.toString() };
  }
  if (requested === 'mux' || /\.m3u8$/i.test(path)) {
    return { kind: 'hls', provider: requested === 'mux' ? 'mux' : 'direct', url: parsed.toString() };
  }

  const provider: VideoProvider = requested !== 'auto'
    ? requested
    : host.includes('bunny') ? 'bunny'
      : host.includes('cloudflarestream') || host.includes('videodelivery.net') ? 'cloudflare'
        : 'iframe';
  return { kind: 'iframe', provider, url: parsed.toString() };
}
