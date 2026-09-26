-- Allow cinematic video uploads in the existing jaecoo-media bucket.
-- 50 MB stays within the project global file-size cap. 80 MB is rejected.
-- Playback settings live in media_assets.presentation_settings.video
-- so no parallel media table is created.

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm'
    ]
where id = 'jaecoo-media';

comment on column media_assets.presentation_settings is
  'Visual editor settings plus optional video playback at key "video": autoplay, muted, loop, controls, plays_inline, preload, object_fit, position, poster_url, start_time, end_time, preset.';
