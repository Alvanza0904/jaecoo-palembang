import assert from 'node:assert/strict'

const source = await import('../lib/types/presentation.ts')
const {
  resolveBreakpointSettings,
  cutoutTransformToCSS,
} = source

const desktopExtremeA = resolveBreakpointSettings({
  desktop: {
    mode: 'custom',
    cutout: { position_x: 0, position_y: 0, scale: 40 },
  },
}, 'desktop')
const desktopExtremeB = resolveBreakpointSettings({
  desktop: {
    mode: 'custom',
    cutout: { position_x: 100, position_y: 100, scale: 150 },
  },
}, 'desktop')

assert.deepEqual(desktopExtremeA.cutout, { position_x: 0, position_y: 0, scale: 40 })
assert.deepEqual(desktopExtremeB.cutout, { position_x: 100, position_y: 100, scale: 150 })
assert.notEqual(
  cutoutTransformToCSS(desktopExtremeA.cutout.position_x, desktopExtremeA.cutout.position_y, desktopExtremeA.cutout.scale),
  cutoutTransformToCSS(desktopExtremeB.cutout.position_x, desktopExtremeB.cutout.position_y, desktopExtremeB.cutout.scale),
)

const inherited = resolveBreakpointSettings({
  desktop: { mode: 'custom', cutout: { position_x: 10, position_y: 20, scale: 40 } },
  mobile: { mode: 'inherited', inherit_from: 'desktop' },
}, 'mobile')
assert.equal(inherited.mode, 'inherited')
assert.deepEqual(inherited.cutout, { position_x: 10, position_y: 20, scale: 40 })

console.log('STEP 5F logic tests: PASS')
console.log('Desktop A:', cutoutTransformToCSS(0, 0, 40))
console.log('Desktop B:', cutoutTransformToCSS(100, 100, 150))
console.log('Inheritance: PASS')
