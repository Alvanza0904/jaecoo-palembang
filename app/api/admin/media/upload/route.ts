/**
 * JAECOO Palembang — Media Upload API
 * STEP 5C: POST /api/admin/media/upload
 *
 * Flow:
 *  1. Auth check (server-side)
 *  2. Receive multipart/form-data: file + category
 *  3. Validate file type and size
 *  4. Upload to Supabase Storage (jaecoo-media bucket)
 *  5. Save metadata to media_assets table
 *  6. Return created asset
 *
 * Security: service_role is NOT used; we use the user's authenticated session
 * via the anon key + RLS policies.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  ALLOWED_TYPES,
  MAX_FILE_SIZE_BYTES,
  buildStoragePath,
} from '@/lib/types/media-asset'

const BUCKET = 'jaecoo-media'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // ── 1. Auth ──────────────────────────────────────────────
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json(
        { error: 'Unauthorized — login required' },
        { status: 401 }
      )
    }

    // ── 2. Parse form data ───────────────────────────────────
    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json(
        { error: 'Request body bukan multipart/form-data yang valid' },
        { status: 400 }
      )
    }

    const file     = formData.get('file') as File | null
    const category = (formData.get('category') as string | null) ?? 'system'
    const focalXRaw = formData.get('focal_x')
    const focalYRaw = formData.get('focal_y')
    const widthRaw  = formData.get('width')
    const heightRaw = formData.get('height')

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'File tidak ditemukan dalam request' },
        { status: 400 }
      )
    }

    // ── 3. Validate ──────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        {
          error: `Format file tidak didukung: "${file.type}". ` +
            'Gunakan JPG, PNG, WebP, AVIF, atau MP4.',
        },
        { status: 422 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        { error: `File terlalu besar: ${mb} MB. Maksimum 10 MB.` },
        { status: 422 }
      )
    }

    // ── 4. Build storage path ────────────────────────────────
    const storagePath = buildStoragePath(
      category as import('@/lib/types/media-asset').MediaCategory,
      file.name
    )

    // ── 5. Upload to Supabase Storage ────────────────────────
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: storageErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (storageErr) {
      console.error('[Upload] Supabase Storage error:', storageErr)

      // Friendly error messages
      let msg = 'Upload ke storage gagal.'
      if (storageErr.message?.includes('already exists')) {
        msg = 'File dengan nama yang sama sudah ada. Coba rename file terlebih dahulu.'
      } else if (storageErr.message?.includes('Bucket not found')) {
        msg = 'Storage bucket belum dikonfigurasi. Hubungi administrator.'
      } else if (storageErr.message?.includes('row-level security')) {
        msg = 'Permission ditolak oleh RLS. Pastikan sudah login.'
      } else if (storageErr.message) {
        msg = 'Storage error: ' + storageErr.message
      }

      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // ── 6. Get public URL ────────────────────────────────────
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    const publicUrl = urlData.publicUrl

    // ── 7. Save metadata to media_assets ────────────────────
    const insertPayload = {
      filename:       file.name,
      storage_path:   storagePath,
      storage_bucket: BUCKET,
      public_url:     publicUrl,
      mime_type:      file.type,
      size_bytes:     file.size,
      category,
      focal_x:        focalXRaw ? Number(focalXRaw) : 50,
      focal_y:        focalYRaw ? Number(focalYRaw) : 50,
      width:          widthRaw ? Number(widthRaw) : null,
      height:         heightRaw ? Number(heightRaw) : null,
      uploaded_by:    user.id,
    }

    const { data: asset, error: dbErr } = await supabase
      .from('media_assets')
      .insert(insertPayload)
      .select()
      .single()

    if (dbErr) {
      console.error('[Upload] DB insert error:', dbErr)
      // Storage upload succeeded but DB failed — clean up storage
      await supabase.storage.from(BUCKET).remove([storagePath])
      return NextResponse.json(
        { error: 'Upload berhasil tapi metadata gagal disimpan: ' + dbErr.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ asset }, { status: 201 })
  } catch (err) {
    console.error('[Upload] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Server error tidak terduga. Coba lagi.' },
      { status: 500 }
    )
  }
}
