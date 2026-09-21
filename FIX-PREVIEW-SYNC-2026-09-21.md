# JAECOO Palembang — Homepage Preview Sync Fix

## What was fixed

1. **Preview and live now use the same homepage section components.**
   - `HomepageSectionRenderer` delegates to the exact public components used by `/`.
   - The old custom preview layout is no longer used by the active homepage editor.

2. **The editor now loads the same homepage media assignments as the live homepage.**
   - `getHomeMedia()` is merged into the admin editor's initial data.

3. **Mobile/Desktop preview now uses a real iframe viewport.**
   - The iframe is 390px wide for Mobile.
   - CSS media queries inside the iframe therefore evaluate against the simulated device width instead of the admin browser width.
   - Desktop uses the actual available preview viewport.

4. **Unused homepage text-position controls were removed.**
   - They previously stored `desktop_position/mobile_position`, but the live homepage did not consume them.
   - Layout is now owned by the shared visual renderer.

5. **Homepage save now invalidates the public homepage cache.**
   - `PATCH /api/admin/homepage-content` calls `revalidatePath('/')` after a successful save.
   - The public homepage is also marked `force-dynamic` to prevent stale CMS output.

6. **Final CTA label/link now respects CMS `ctaText` and `ctaUrl`.**

## Validation

The repository does not contain installed `node_modules` in this environment. `npm ci --offline` cannot complete because the required packages are not cached, so a full Next.js production build could not be executed here.

A TypeScript pass was run with the globally available `tsc`. The remaining errors are dependency/type-environment errors such as missing `react`, `next`, and CSS-module declarations; no new project-specific type error was observed in the modified admin page after the media merge was corrected.
