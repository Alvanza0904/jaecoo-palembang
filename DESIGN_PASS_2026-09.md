# JAECOO Palembang — Global Design Pass

This pass moves the project from foundation/placeholder UI toward the locked premium automotive design system.

Implemented:
- Homepage storytelling structure: Hero, Range, Experience, Technology, Promo, About Alvan, Journal, Global CTA.
- Interactive/editorial-style Range presentation using the existing model data.
- Premium editorial layouts for Model Index, Promo, Journal, and Gallery.
- Global header simplified to JAECOO logo + hamburger on all breakpoints; desktop nav/CTA moved into the full menu.
- Manrope restored as the single global public typography family.
- Admin dashboard now exposes the planned global section map.
- Model Content editor now includes the planned per-section structure without introducing final visual controls yet.
- Responsive CSS is mobile-first and uses the existing Desktop/Tablet/Mobile/Small Mobile direction.
- Existing media/editor, Supabase, SEO foundation, auth, pricing and finance logic were intentionally not replaced.

Deferred to final visual QA:
- Per-section visual editor controls.
- Device preview inside the visual editor.
- Final live Hero positioning/cutout QA.
- Final asset selection/cropping/art direction.
- Production browser QA, Lighthouse and deployment verification.

Environment note:
- Dependencies are not installed in the supplied environment, so a real Next.js lint/build could not be claimed from this pass.
