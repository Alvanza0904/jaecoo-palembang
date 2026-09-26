"use client";

import { useEffect, useMemo, useState } from "react";
import { CmsVideo } from "@/components/media/CmsVideo";
import { MediaPicker } from "./MediaPicker";
import { replaceMediaFile, uploadToStorage, prepareStorageUpload } from "@/lib/media/direct-upload";
import type { MediaAsset } from "@/lib/types/media-asset";
import { validateFile } from "@/lib/types/media-asset";
import {
  VIDEO_PRESET_OPTIONS,
  applyVideoPreset,
  readVideoSettings,
  type VideoPlaybackSettings,
  type VideoPosition,
  type VideoPreload,
  type VideoPresetId,
} from "@/lib/types/video";
import styles from "./VideoEditor.module.css";

interface VideoEditorProps {
  asset: MediaAsset;
  onClose: () => void;
  onUpdated: (asset: MediaAsset) => void;
}

export function VideoEditor({ asset, onClose, onUpdated }: VideoEditorProps) {
  const stored = useMemo(() => readVideoSettings(asset.presentation_settings), [asset]);
  const [draft, setDraft] = useState<VideoPlaybackSettings>(stored);
  const [current, setCurrent] = useState(asset);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [posterOpen, setPosterOpen] = useState(false);

  useEffect(() => {
    setDraft(readVideoSettings(asset.presentation_settings));
    setCurrent(asset);
    setDirty(false);
  }, [asset]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patch(next: Partial<VideoPlaybackSettings>) {
    setDraft((row) => ({ ...row, ...next, preset: "custom" }));
    setDirty(true);
    setMessage("");
  }

  function choosePreset(preset: VideoPresetId) {
    setDraft((row) => applyVideoPreset(row, preset));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const settings = {
        ...(current.presentation_settings ?? {}),
        video: draft,
      };
      const res = await fetch("/api/admin/media/presentation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: current.id, settings }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan video.");
      const updated = json.asset as MediaAsset;
      setCurrent(updated);
      setDirty(false);
      setMessage("Tersimpan");
      onUpdated(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function applyVideo() {
    const updated = dirty ? await save() : current;
    if (updated) onClose();
  }

  async function replaceFile(file: File) {
    const invalid = validateFile(file);
    if (invalid) { setError(invalid); return; }
    if (!file.type.startsWith("video/")) { setError("Pilih file MP4 atau WebM."); return; }
    setReplacing(true);
    setError("");
    setProgress(0);
    try {
      await prepareStorageUpload();
      const path = await uploadToStorage(file, current.category, setProgress);
      try {
        const updated = await replaceMediaFile(current.id, {
          storage_path: path,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });
        setCurrent(updated);
        onUpdated(updated);
        setMessage("Video diganti");
      } catch (err) {
        setError(err instanceof Error ? `${err.message} Video lama tetap aktif.` : "Gagal mengganti. Video lama tetap aktif.");
      }
    } catch (err) {
      setError(err instanceof Error ? `${err.message} Video lama tetap aktif.` : "Upload gagal. Video lama tetap aktif.");
    } finally {
      setReplacing(false);
      setProgress(0);
    }
  }

  async function removePoster() {
    patch({ poster_url: null, poster_asset_id: null, preset: draft.preset });
  }

  function requestClose() {
    if (dirty && !window.confirm("Ada perubahan yang belum disimpan. Keluar tanpa menyimpan?")) return;
    onClose();
  }

  return (
    <div className={styles.editor}>
      <div className={styles.preview}>
        <CmsVideo
          src={current.public_url}
          poster={draft.poster_url}
          settings={draft}
          priority
          label={draft.title || current.filename}
        />
      </div>

      <div className={styles.panel}>
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>VIDEO EDITOR</p>
            <h2 className={styles.title}>{current.filename}</h2>
          </div>
          {dirty && <span className={styles.unsaved}>Unsaved changes</span>}
        </div>

        <label className={styles.label}>Preset</label>
        <div className={styles.presets}>
          {VIDEO_PRESET_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={draft.preset === item.id ? styles.presetOn : styles.preset}
              onClick={() => choosePreset(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className={styles.block}>
          <h3>Video file</h3>
          <label className={styles.fileBtn}>
            {replacing ? `Mengunggah ${progress}%` : "Replace Video"}
            <input
              type="file"
              accept="video/mp4,video/webm"
              hidden
              disabled={replacing}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void replaceFile(file);
                event.target.value = "";
              }}
            />
          </label>
          {replacing && <div className={styles.bar}><span style={{ width: `${progress}%` }} /></div>}
        </section>

        <section className={styles.block}>
          <h3>Poster</h3>
          {draft.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.poster_url} alt="" className={styles.poster} />
          ) : null}
          <div className={styles.row}>
            <button type="button" className={styles.fileBtn} onClick={() => setPosterOpen(true)}>
              {draft.poster_url ? "Ganti poster" : "Pilih poster"}
            </button>
            {draft.poster_url && <button type="button" className={styles.fileBtn} onClick={() => void removePoster()}>Hapus poster</button>}
          </div>
        </section>

        <section className={styles.block}>
          <h3>Playback</h3>
          <Toggle label="Autoplay" checked={draft.autoplay} onChange={(autoplay) => patch(autoplay ? { autoplay: true, muted: true } : { autoplay: false })} />
          <Toggle label="Muted" checked={draft.muted || draft.autoplay} disabled={draft.autoplay} onChange={(muted) => patch({ muted })} />
          <Toggle label="Loop" checked={draft.loop} onChange={(loop) => patch({ loop })} />
          <Toggle label="Controls" checked={draft.controls} onChange={(controls) => patch({ controls })} />
          <Toggle label="Plays Inline" checked={draft.plays_inline} onChange={(plays_inline) => patch({ plays_inline })} />
          {draft.autoplay && <p className={styles.note}>Autoplay browser hanya jalan jika video muted.</p>}
        </section>

        <section className={styles.block}>
          <h3>Loading</h3>
          <label className={styles.label}>Preload</label>
          <select className={styles.select} value={draft.preload} onChange={(event) => patch({ preload: event.target.value as VideoPreload })}>
            <option value="none">None</option>
            <option value="metadata">Metadata</option>
            <option value="auto">Auto</option>
          </select>
        </section>

        <section className={styles.block}>
          <h3>Display</h3>
          <label className={styles.label}>Object Fit</label>
          <select className={styles.select} value={draft.object_fit} onChange={(event) => patch({ object_fit: event.target.value as "cover" | "contain" })}>
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
          </select>
          <label className={styles.label}>Position</label>
          <select className={styles.select} value={draft.position} onChange={(event) => patch({ position: event.target.value as VideoPosition })}>
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          <div className={styles.times}>
            <label>Start (detik)<input className={styles.input} type="number" min={0} value={draft.start_time ?? ""} onChange={(event) => patch({ start_time: event.target.value === "" ? null : Number(event.target.value) })} /></label>
            <label>End (detik)<input className={styles.input} type="number" min={0} value={draft.end_time ?? ""} onChange={(event) => patch({ end_time: event.target.value === "" ? null : Number(event.target.value) })} /></label>
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}
        {message && !error && <p className={styles.ok}>{message}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={requestClose}>Cancel</button>
          <button type="button" className={styles.save} onClick={() => void save()} disabled={saving || !dirty}>{saving ? "Menyimpan..." : "Save"}</button>
          <button type="button" className={styles.use} onClick={() => void applyVideo()}>Gunakan Video</button>
        </div>
      </div>

      <MediaPicker
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        title="Pilih poster"
        imagesOnly
        directSelect
        onSelect={(poster) => {
          if (!poster.mime_type.startsWith("image/") || !poster.public_url) {
            setError("Poster harus berupa gambar.");
            return;
          }
          setDraft((row) => ({ ...row, poster_url: poster.public_url, poster_asset_id: poster.id }));
          setDirty(true);
          setPosterOpen(false);
        }}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
