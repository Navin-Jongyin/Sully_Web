import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import type { OnlineCourseLesson } from './types';
import { resolveVideoSource } from '../lib/video-source';

interface CourseVideoPlayerProps {
  lesson: OnlineCourseLesson;
  startAtSeconds?: number;
  onProgress: (currentTime: number, duration: number) => void;
  onEnded: () => void;
}

export const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({
  lesson,
  startAtSeconds = 0,
  onProgress,
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = resolveVideoSource(lesson);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || source.kind !== 'hls' || !source.url) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source.url;
      return;
    }
    if (!Hls.isSupported()) return;
    const hls = new Hls();
    hls.loadSource(source.url);
    hls.attachMedia(video);
    return () => hls.destroy();
  }, [source.kind, source.url]);

  if (source.kind === 'none' || !source.url) {
    return <div className="commerce-video-unavailable">Video is not available for this lesson yet.</div>;
  }

  if (source.kind === 'iframe') {
    return (
      <div className="commerce-video-frame">
        <iframe
          src={source.url}
          title={lesson.title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>
    );
  }

  return (
    <video
      key={`${lesson.id}:${source.url}`}
      ref={videoRef}
      className="commerce-native-video"
      controls
      playsInline
      preload="metadata"
      src={source.kind === 'native' ? source.url : undefined}
      onLoadedMetadata={(event) => {
        const video = event.currentTarget;
        if (startAtSeconds > 0 && startAtSeconds < video.duration - 2) {
          video.currentTime = startAtSeconds;
        }
      }}
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        onProgress(video.currentTime, Number.isFinite(video.duration) ? video.duration : 0);
      }}
      onEnded={onEnded}
    />
  );
};
