import assert from 'node:assert/strict'

const source = await import('../lib/types/presentation.ts')
const { BREAKPOINT_PREVIEW_DIMS, getBackgroundLayerStyle, getCutoutLayerStyle } = source

assert.equal(BREAKPOINT_PREVIEW_DIMS.mobile.width / BREAKPOINT_PREVIEW_DIMS.mobile.height, 135 / 240)
assert.equal(BREAKPOINT_PREVIEW_DIMS.small_mobile.width / BREAKPOINT_PREVIEW_DIMS.small_mobile.height, 124 / 220)

const settings = {
  mobile: { mode: 'custom', position_x: 2, position_y: 38, scale: 125, object_fit: 'cover', cutout: { position_x: 2, position_y: 38, scale: 125 } },
}

const bg = getBackgroundLayerStyle(settings, 'mobile')
assert.equal(bg.objectPosition, '2% 38%')
assert.equal(bg.transform, 'scale(1.25)')
assert.equal(bg.transformOrigin, '2% 38%')

const cutout = getCutoutLayerStyle(settings, 'mobile')
assert.equal(cutout.objectFit, 'contain')
assert.equal(cutout.objectPosition, '50% 50%')
assert.equal(cutout.transform, 'translate(-48%, -12%) scale(1.25)')
assert.equal(cutout.transformOrigin, '50% 50%')

console.log('STEP 6A Editor ↔ Live sync invariants: PASS')
