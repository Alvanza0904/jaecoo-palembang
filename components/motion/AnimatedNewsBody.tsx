/**
 * JAECOO Palembang — AnimatedNewsBody
 *
 * Renderer konten berita (body_html) dengan scroll animation otomatis.
 *
 * SEMUA artikel baru yang dibuat di Supabase/CMS akan OTOMATIS mendapat
 * animasi — tidak perlu editing kode manual per artikel.
 *
 * Cara kerja:
 * 1. Parse body_html menjadi DOM tree (DOMParser, client-side only).
 * 2. Pisahkan konten per "block" (h1-h6, p, ul, ol, blockquote, figure, div).
 * 3. Render setiap block dibungkus AnimatedText dengan index berbeda.
 * 4. Variant dipilih deterministik berdasarkan index + tag type.
 *
 * Fallback SSR: Jika body_html di-render langsung (dangerouslySetInnerHTML),
 * semua text tetap terlihat — animasi hanya enhancement.
 *
 * Jika body_html kosong, render nothing.
 */

"use client";

import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import type { RevealVariant } from "./Reveal";

interface AnimatedNewsBodyProps {
  html: string;
  className?: string;
  blockClassName?: string;
}

/** Map tag ke variant pool untuk variasi natural per elemen */
const TAG_VARIANT_MAP: Record<string, RevealVariant[]> = {
  h1: ["mask", "scale", "blur", "fade-up"],
  h2: ["fade-up", "mask", "scale", "blur"],
  h3: ["slide-left", "fade-up", "blur", "scale"],
  h4: ["fade-up", "slide-left", "fade", "scale"],
  h5: ["fade-up", "fade", "scale"],
  h6: ["fade-up", "fade"],
  p:  ["fade-up", "fade", "slide-left", "fade-down", "slide-right", "blur", "fade-up", "scale"],
  ul: ["fade-up", "slide-left", "fade"],
  ol: ["fade-up", "slide-left", "fade"],
  blockquote: ["blur", "scale", "mask", "fade-up"],
  figure:     ["fade-up", "scale", "fade"],
  div:        ["fade-up", "fade", "slide-left"],
  table:      ["fade-up", "fade"],
};

const BLOCK_TAGS = ["h1","h2","h3","h4","h5","h6","p","ul","ol","blockquote","figure","div","table","hr","pre"];

function getTagVariant(tag: string, index: number): RevealVariant {
  const pool = TAG_VARIANT_MAP[tag] ?? TAG_VARIANT_MAP.p;
  // Deterministic: (index * prime) % poolLength — stabil, tidak random
  return pool[(index * 3 + 7) % pool.length];
}

function getTagDelay(tag: string, index: number): number {
  // Heading sedikit lebih awal, paragraf stagger ringan
  if (tag.startsWith("h")) return 0;
  // Stagger max 3 step untuk mencegah delay terlalu panjang
  return (index % 3) * 70;
}

/** Wrap plain text in paragraph tags if no HTML tags detected */
function ensureHtml(html: string): string {
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html);
  if (hasHtmlTags) return html;
  // Plain text — split by double newline into paragraphs
  return html
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, ' ')}</p>`)
    .join('\n');
}

/** Parse HTML string menjadi array block HTML */
function parseBlocks(html: string): Array<{ tag: string; html: string }> {
  html = ensureHtml(html);
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.querySelector("div");
    if (!root) return [{ tag: "div", html }];

    const blocks: Array<{ tag: string; html: string }> = [];

    for (const child of Array.from(root.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          blocks.push({ tag: "p", html: `<p>${text}</p>` });
        }
        continue;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tag = el.tagName.toLowerCase();
        if (BLOCK_TAGS.includes(tag)) {
          blocks.push({ tag, html: el.outerHTML });
        } else {
          // Inline tag (span, a, img, etc.) → bungkus dalam p
          blocks.push({ tag: "p", html: `<p>${el.outerHTML}</p>` });
        }
      }
    }

    return blocks.length > 0 ? blocks : [{ tag: "div", html }];
  } catch {
    return [{ tag: "div", html }];
  }
}

export function AnimatedNewsBody({ html, className, blockClassName }: AnimatedNewsBodyProps) {
  const [blocks, setBlocks] = useState<Array<{ tag: string; html: string }> | null>(null);

  useEffect(() => {
    // Parse hanya di client — DOMParser tidak tersedia di server
    setBlocks(parseBlocks(html));
  }, [html]);

  // SSR / sebelum hydration: render full HTML langsung (SEO-safe, no CLS)
  // Setelah hydration: replace dengan animated blocks
  if (!blocks) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className={className}>
      {blocks.map((block, i) => (
        <Reveal
          key={i}
          variant={getTagVariant(block.tag, i)}
          delay={getTagDelay(block.tag, i)}
          threshold={0.08}
        >
          <div
            className={blockClassName}
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        </Reveal>
      ))}
    </div>
  );
}
