export type VideoPreload = "none" | "metadata" | "auto";
export type VideoObjectFit = "cover" | "contain";
export type VideoPosition = "center" | "top" | "bottom" | "left" | "right";
export type VideoPresetId = "cinematic_hero" | "standard" | "background" | "custom";

export interface VideoPlaybackSettings {
  preset: VideoPresetId;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  plays_inline: boolean;
  preload: VideoPreload;
  object_fit: VideoObjectFit;
  position: VideoPosition;
  poster_url: string | null;
  poster_asset_id: string | null;
  start_time: number | null;
  end_time: number | null;
  title: string;
  description: string;
}

const PRESET_VALUES: Record<Exclude<VideoPresetId, "custom">, Omit<VideoPlaybackSettings, "preset" | "poster_url" | "poster_asset_id" | "start_time" | "end_time" | "title" | "description">> = {
  cinematic_hero: {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
    plays_inline: true,
    preload: "metadata",
    object_fit: "cover",
    position: "center",
  },
  standard: {
    autoplay: false,
    muted: false,
    loop: false,
    controls: true,
    plays_inline: true,
    preload: "metadata",
    object_fit: "contain",
    position: "center",
  },
  background: {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
    plays_inline: true,
    preload: "metadata",
    object_fit: "cover",
    position: "center",
  },
};

export const VIDEO_PRESET_OPTIONS: Array<{ id: VideoPresetId; label: string }> = [
  { id: "cinematic_hero", label: "Cinematic Hero" },
  { id: "standard", label: "Standard Video" },
  { id: "background", label: "Background Video" },
  { id: "custom", label: "Custom" },
];

export function videoPositionToCss(position: VideoPosition): string {
  switch (position) {
    case "top": return "50% 0%";
    case "bottom": return "50% 100%";
    case "left": return "0% 50%";
    case "right": return "100% 50%";
    default: return "50% 50%";
  }
}

export function defaultVideoSettings(preset: VideoPresetId = "cinematic_hero"): VideoPlaybackSettings {
  const base = preset === "custom" ? PRESET_VALUES.cinematic_hero : PRESET_VALUES[preset];
  return {
    preset,
    ...base,
    poster_url: null,
    poster_asset_id: null,
    start_time: null,
    end_time: null,
    title: "",
    description: "",
  };
}

export function applyVideoPreset(current: VideoPlaybackSettings, preset: VideoPresetId): VideoPlaybackSettings {
  if (preset === "custom") return { ...current, preset: "custom" };
  return {
    ...current,
    preset,
    ...PRESET_VALUES[preset],
  };
}

function bool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export function readVideoSettings(presentation: unknown): VideoPlaybackSettings {
  const raw = presentation && typeof presentation === "object"
    ? (presentation as { video?: unknown }).video
    : undefined;
  const row = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const preset = row.preset === "standard" || row.preset === "background" || row.preset === "custom" || row.preset === "cinematic_hero"
    ? row.preset
    : "cinematic_hero";
  const base = defaultVideoSettings(preset === "custom" ? "cinematic_hero" : preset);
  const position = row.position;
  const preload = row.preload;
  const objectFit = row.object_fit;
  return {
    preset,
    autoplay: bool(row.autoplay, base.autoplay),
    muted: bool(row.muted, base.muted),
    loop: bool(row.loop, base.loop),
    controls: bool(row.controls, base.controls),
    plays_inline: bool(row.plays_inline, base.plays_inline),
    preload: preload === "none" || preload === "auto" || preload === "metadata" ? preload : base.preload,
    object_fit: objectFit === "contain" || objectFit === "cover" ? objectFit : base.object_fit,
    position: position === "top" || position === "bottom" || position === "left" || position === "right" || position === "center"
      ? position
      : base.position,
    poster_url: typeof row.poster_url === "string" && row.poster_url ? row.poster_url : null,
    poster_asset_id: typeof row.poster_asset_id === "string" && row.poster_asset_id ? row.poster_asset_id : null,
    start_time: numOrNull(row.start_time),
    end_time: numOrNull(row.end_time),
    title: typeof row.title === "string" ? row.title : "",
    description: typeof row.description === "string" ? row.description : "",
  };
}

export function isVideoMime(mime?: string | null) {
  return !!mime && mime.startsWith("video/");
}

export function isVideoUrl(url?: string | null) {
  return !!url && /\.(mp4|webm)(\?|$)/i.test(url);
}

export function isVideoSource(mime?: string | null, url?: string | null) {
  return isVideoMime(mime) || isVideoUrl(url);
}

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
