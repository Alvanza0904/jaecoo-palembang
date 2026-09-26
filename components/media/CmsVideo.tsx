"use client";

import { useEffect, useRef, useState } from "react";
import {
  readVideoSettings,
  videoPositionToCss,
  type VideoPlaybackSettings,
} from "@/lib/types/video";
import styles from "./CmsVideo.module.css";

interface CmsVideoProps {
  src?: string | null;
  poster?: string | null;
  settings?: VideoPlaybackSettings | unknown;
  priority?: boolean;
  className?: string;
  label?: string;
  /** Show a play control. Background videos stay cinematic unless this is set. */
  playable?: boolean;
}

export function CmsVideo({
  src,
  poster,
  settings,
  priority = false,
  className,
  label = "Video",
  playable = false,
}: CmsVideoProps) {
  const playback = readVideoSettings(settings && typeof settings === "object" && "autoplay" in (settings as object) ? { video: settings } : settings);
  const canControl = playable || playback.controls;
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(priority);
  const [playing, setPlaying] = useState(false);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = playback.autoplay ? true : playback.muted;
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }

  useEffect(() => {
    setFailed(false);
  }, [src]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || priority) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed || !src) return;
    if (playback.start_time != null && Math.abs(video.currentTime - playback.start_time) > 0.4 && video.currentTime < (playback.start_time ?? 0)) {
      try { video.currentTime = playback.start_time; } catch { /* metadata not ready */ }
    }
    if (!inView) {
      video.pause();
      return;
    }
    if (playback.autoplay) {
      video.muted = true;
      video.play().catch(() => setFailed(false));
    }
  }, [failed, inView, playback.autoplay, playback.start_time, src]);

  function onTimeUpdate() {
    const video = videoRef.current;
    if (!video || playback.end_time == null) return;
    if (video.currentTime >= playback.end_time) {
      if (playback.loop) {
        video.currentTime = playback.start_time ?? 0;
        if (playback.autoplay) void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }
  }

  const posterUrl = poster || playback.poster_url || undefined;
  const showPoster = !src || failed;

  return (
    <div ref={rootRef} className={`${styles.root} ${className ?? ""}`}>
      {showPoster ? (
        posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl} alt={label} className={styles.media} />
        ) : (
          <div className={styles.fallback} role="img" aria-label={label} />
        )
      ) : (
        <video
          ref={videoRef}
          className={styles.media}
          src={inView || priority ? src ?? undefined : undefined}
          poster={posterUrl}
          autoPlay={playback.autoplay && inView}
          muted={playback.autoplay ? true : playback.muted}
          loop={playback.loop && playback.end_time == null}
          controls={canControl}
          playsInline={playback.plays_inline}
          preload={priority ? playback.preload : inView ? playback.preload : "none"}
          style={{
            objectFit: playback.object_fit,
            objectPosition: videoPositionToCss(playback.position),
          }}
          aria-label={playback.title || label}
          onClick={canControl ? togglePlay : undefined}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
          onLoadedMetadata={(event) => {
            if (playback.start_time != null) {
              event.currentTarget.currentTime = playback.start_time;
            }
          }}
          onTimeUpdate={onTimeUpdate}
        />
      )}
      {canControl && src && !failed && !playing && (
        <button type="button" className={styles.playButton} onClick={togglePlay} aria-label="Putar video">
          <span className={styles.playIcon} />
        </button>
      )}
    </div>
  );
}
